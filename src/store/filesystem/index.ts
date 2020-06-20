import { observable, action, runInAction, toJS } from 'mobx'
import { get, post } from '../../axios/index'
import { FileNode } from './file'
import { monacoService as Monaco } from '../monaco/index'
import { git } from '../git/index'
import { loader } from '../loader/index'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { Message } from 'react-ryui'
const $: any = document.querySelector.bind(document)
const Window: any = window
const message = new Message({
  duration: 3,
  dark: Window.config.dark,
  position: 'br'
})
class FileSystem {
  @observable baseUrl = ''
  @observable mustRender = 0
  @observable modelNumber = 0
  @observable dragFile: FileNode
  @observable loading: boolean = false
  @observable tabLoading: boolean = false
  @observable files: any = {
    children: [],
    name: '',
    path: '',
    size: 0,
    type: '',
    errorMessage: ''
  }
  @observable expandFolder = []
  @observable cacheFiles: any = []
  @action setExpandFolder = (expandFolder) => {
    this.expandFolder = expandFolder
  }
  notSaveCount = () => {
    return this.cacheFiles.filter(item => item.notSave).length
  }
  @action touchRender = () => {
    this.mustRender = Math.random()
  }
  @action setCacheFileValue = (cacheFile, value) => { // 更新内容
    cacheFile.value = value
    this.cacheFiles = [...this.cacheFiles]
  }
  @action setBaseUrl = (baseUrl: string): void => { // 按照路由设置 项目基本信息
    this.baseUrl = baseUrl
    this.files.path = baseUrl
    this.files.name = baseUrl.split('/').pop()
    $('#title').innerHTML = `${this.files.name}`
  }
  @action queryFiles = async () => {
    this.loading = true
    const { isError, data } = await get('/workbench/file/filelist', {
      path: this.baseUrl
    })
    if (data === null) {
      runInAction(() => {
        message.error('项目加载异常.')
        loader.addStepInfos({
          isError: true,
          message: '项目加载异常.'
        })
        this.loading = false
      })
    }
    if (!isError && data) {
      await git.queryStatus() // 查询git状态
      runInAction(async () => {
        this.files = Object.assign({}, data, { children: this.tansformFiles(data.children) })
        this.loading = false
      })
      loader.addStepInfos({
        isError: false,
        message: '项目加载完毕.'
      })
    }
  }
  @action refreshWt = async () => { // 渲染状态树
    this.modelNumber = 0 // 重制
    this.files.children = this.tansformFiles(this.files.children)
  }
  @action tansformFiles = (children) => { // 数据排序 + 转换
    let status = git.getStatusFiles() // git status
    let dir = children.filter(_item => _item.type === 'directory').sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
    let files = children.filter(_item => _item.type === 'file').sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
    let sortChildren = dir.concat(files)
    return sortChildren && sortChildren.map((fileNode, _index) => {
      fileNode.isOpen = fileNode.isOpen || false
      let gitignores = false // 暂时不做
      let children = null
      if (fileNode.type === 'directory') {
        children = this.tansformFiles(fileNode.children)
      }
      let nodeStatus = status.find(item => {
        return (item.path.startsWith(fileNode.path) && item.path[fileNode.path.length] === '/') || item.path === fileNode.path
      }) || { status: null, color: null }
      fileNode.status = nodeStatus.status
      fileNode.color = nodeStatus.color
      let node = new FileNode(fileNode, false, '', gitignores, children)
      if (['.ts', '.tsx'].indexOf(fileNode.extension) > -1) {
        this.modelNumber ++
      }
      return node
    })
  }
  @action getFile = async (path: string) => {// 查询文件
    return await get('/workbench/file/getfile', {
      path
    })
  }
  @action openFile = async (fileNode: FileNode) => { // 打开文件
    if (!fileNode) { return }
    if (!this.cacheFiles.some(_cacheFile => { // 不在缓存就发送请求
      return _cacheFile.path === fileNode.path && fileNode.diffEditor === _cacheFile.diffEditor
    })) {
      this.tabLoading = true
      const { isError, data } = await this.getFile(fileNode.path)
      if (isError) {
        message.error(`打开文件 ${fileNode.name} 异常.`)
      } else {
        // 不拷贝一下 会有问题
        runInAction(() => {
          this.cacheFiles.forEach(cacheFile => cacheFile.selected = false) // 清空选中态
          let cacheFile: FileNode = Object.assign({}, fileNode, {
            content: data,
            value: data,
            selected: true,
            notSave: false
          })
          this.cacheFiles.push(cacheFile)
        })
      }
    } else {
      this.cacheFiles.forEach(item => item.selected = item.path === fileNode.path && fileNode.diffEditor === item.diffEditor)
    }
    runInAction(() => {
      this.mustRender = Math.random()
      this.tabLoading = false
    })
  }
  @action closeOther = (node: FileNode) => {
    this.closeAll()
    node.selected = true
    this.cacheFiles.push(node)
    Monaco.updateModelOptions() // 更新modelOptions
  }
  @action closeAll = () => {
    this.cacheFiles.length = 0
  }
  @action closeFile = (fileNode) => {
    let index = this.cacheFiles.findIndex(file => { // 找到关闭的文件
      return file.path === fileNode.path && file.diffEditor === fileNode.diffEditor
    })
    if (index > -1) {
      this.cacheFiles.splice(index, 1)
      this.cacheFiles.forEach((file, index) => file.selected = index === 0) // 默认选中第一个
    }
  }
  @action queryCurrentNode = (): FileNode => {
    return this.cacheFiles.find(cacheFile => {
      return cacheFile.selected
    }) || {}
  }
  @action toBeSave = (save: boolean, cacheFile) => {
    cacheFile.notSave = save
    this.cacheFiles = [...this.cacheFiles]
  }
  @action saveCurrentFile = () => {
    this.saveFile(this.queryCurrentNode().path)
  }
  @action saveFile = async (path: string) => {
    const file = this.cacheFiles.find(fileNode => {
      return fileNode.path === path && fileNode.diffEditor === false
    })
    if (file && file.content !== file.value) { // 内容修改才可以保存
      this.tabLoading = true
      const { isError } = await post('/workbench/file/savefile', {
        path: file.path,
        content: file.value
      }, {})
      runInAction(async () => {
        this.tabLoading = false
        if (!isError) {
          file.content = file.value // 更新节点的content
          await this.toBeSave(false, file)
          await git.queryStatus() // 查询git状态
          await this.refreshWt() // 更新状态树
          // 更新设置
          if (this.baseUrl + '/' + '.vscode/settings.json' === file.path) {
            Monaco.setOptions(file.value)
          } else if (this.baseUrl + '/' + '.vscode/tsconfig.json' === file.path) {
            Monaco.setCompilerOptions(file.value)
          }
        } else {
          message.error('文件保存失败.')
        }
      })
    }
  }
  /**
   * 文件树操作
   */
  @action newFileTobe = async (fileNode, isRoot) => {
    fileNode.isOpen = true
    fileNode.icon = 'icon-expand'
    let node = new FileNode({
      extension: '',
      name: '',
      path: fileNode.path,
      size: 0,
      status: '',
      isOpen: false,
      type: 'file',
    }, isRoot, '', false, null)
    node.newFile = true
    fileNode.children.push(node)
    this.expandFolder.push(fileNode.path) // open
    this.mustRender = Math.random()
  }
  @action newFileSave = async (fileNode, node, filename) => {
    if (filename === '') {
      fileNode.children = fileNode.children.filter(_item => {
        return _item.path !== node.path
      })
    } else {
      const { isError } = await post('/workbench/file/new', {
        path: fileNode.path,
        filename
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
      } else {
        message.error('添加文件失败.')
      }
    }
    runInAction(() => {
      this.mustRender = Math.random()
    })
  }
  @action renameFileTobe = async (fileNode) => {
    fileNode.rename = true
    this.mustRender = Math.random()
  }
  @action renameSave = async (path, fileNode, newName) => {
    if (newName === '' || fileNode.name === newName) {
      fileNode.rename = false
      this.mustRender = Math.random()
    } else {
      const { isError, error } = await post('/workbench/file/rename', {
        path,
        oldName: fileNode.name,
        newName
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
        runInAction(() => {
          let newPath = fileNode.path.substr(0, fileNode.path.lastIndexOf('/')) + '/' + newName // 最新路径
          /** 保持文件夹打开状态 */
          if (this.expandFolder.indexOf(fileNode.path) > -1) {
            this.expandFolder.push(newPath)
          }
          if (fileNode.type === 'directory') {
            let cache = this.cacheFiles.filter(_file => {
              return _file.path.startsWith(fileNode.path)
            })
            cache.map(_item => {
              _item.path = newPath + '/' + _item.name
              _item.key = _item.path
            })
            this.cacheFiles = [...this.cacheFiles]

          } else {
            let cacheFile = this.cacheFiles.find(item => item.path === fileNode.path)
            // 同步已经打开的 cacheFiles
            if (cacheFile) {
              FileNode.ReNameNode(newName, cacheFile)
              this.cacheFiles = [...this.cacheFiles]
            }
          }
        })
      } else {
        runInAction(() => {
          fileNode.rename = false
          this.mustRender = Math.random()
          message.error('文件重命名失败.')
        })
      }
    }
  }
  @action newFolderTobe = async (fileNode, isRoot) => {
    fileNode.isOpen = true
    fileNode.icon = 'icon-expand'
    let node = new FileNode({
      extension: '',
      name: '',
      path: fileNode.path,
      size: 0,
      status: '',
      isOpen: false,
      type: 'directory',
    }, isRoot, '', false, [])
    node.newFolder = true
    fileNode.children.push(node)
    this.expandFolder.push(fileNode.path) // open
    this.mustRender = Math.random()
  }
  @action newFolderSave = async (fileNode, node, foldername) => {
    if (foldername === '') {
      fileNode.children = fileNode.children.filter(_item => {
        return _item.path !== node.path
      })
    } else {
      const { isError } = await post('/workbench/file/newfolder', {
        path: fileNode.path,
        foldername
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
      } else {
        fileNode.children = fileNode.children.filter(_item => {
          return _item.path !== node.path
        })
        message.error('添加文件夹失败.')
      }
    }
    runInAction(() => {
      this.mustRender = Math.random()
    })
  }
  @action closeFolder = (children) => { // 关闭文件夹下所有文件
    children.forEach(fileNode => {
      if (fileNode.type === 'directory') {
        this.closeFolder(fileNode.children)
      } else {
        this.closeFile(fileNode)
      }
    })
  }
  @action deleteFile = async (fileNode) => {
    const { isError } = await post('/workbench/file/delete', {
      path: fileNode.path.substr(0, fileNode.path.lastIndexOf('/')),
      filename: fileNode.name
    }, {})
    if (!isError) {
      fileNode.type === 'directory' ? this.closeFolder(fileNode.children) : this.closeFile(fileNode)
      await git.queryStatus()
      await this.queryFiles()
    } else {
      message.error('删除文件失败')
    }
  }
  /**
    monaco相关
   */
  @action getFileNodeEditorMonaco = (): monaco.editor.IStandaloneCodeEditor => {
    const editor: FileNode = this.queryCurrentNode()
    return editor && editor.editorMonaco || null
  }
  @action setFileNodeEditorMonacoByPath = (editorMonaco: monaco.editor.IStandaloneCodeEditor, path: string) => {
    const cacheFile: FileNode = this.cacheFiles.find(cacheFile => {
      return cacheFile.path === path
    })
    cacheFile && (cacheFile.editorMonaco = editorMonaco)
    this.mustRender = Math.random()
  }
  @action getFileNodeEditorMonacoByPath = (path: string): monaco.editor.IStandaloneCodeEditor => {
    const editor = this.cacheFiles.find(_cacheFile => {
      return _cacheFile.path === path
    })
    return editor && editor.editorMonaco
  }
  @action setFileNodeDiffEditorMonaco = (diffEditorMonaco) => {
    const editor: FileNode = this.queryCurrentNode()
    editor && (editor.diffEditorMonaco = diffEditorMonaco)
  }
  /**
   * 传入文件路径获取FileNode,可以是外部文件
   */
  @action getFileNodeByPath = (path: string, status: string, level: any) => {
    let fileNode = {
      prefix: '',
      path, // 节点对应的文件路径
      extension: path.substring(path.lastIndexOf(".")), // 节点后缀
      name: path.substring(path.lastIndexOf("/") + 1), // 节点文件名
      size: '', // 节点文件大小
      type: 'file', // 节点是目录还是文件
      isOpen: false, // 节点是否处于展开状态
      status,
    }
    let node = new FileNode(fileNode, false, '', false, null)
    return node
  }
  /**
   * 打开当前选中的git记录
  */
  @action openStageFile = async () => {
    let fileNode = Object.assign({}, this.queryCurrentNode()) // simple deep
    let status = git.getStatusFiles().find(item => item.path === fileNode.path)
    console.log('status', status)
    if (status) { // 有记录才打开
      fileNode.prefix =  status.isStaged ? ' (Staged)' : status.status === 'U' ? ' (Untracked)' : ' (WorkTree)'
      fileNode.diffEditor = true
      await git.queryStagedText(fileNode)
      await this.openFile(fileNode)
    }
  }
  /**
    download
  */
  @action downloadFile = async (fileNode) => {
    window.open(`/workbench/file/download?path=${fileNode.path}&type=${fileNode.type === 'file' ? 'file' : 'dir'}`, '_parent')
    // 删除压缩文件
    fileNode.name += '.zip'
    fileNode.path += `/${fileNode.name}`
    this.deleteFile(fileNode)
  }
}
const fileSystem = new FileSystem()
export {
  fileSystem
}