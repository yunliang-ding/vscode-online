import { observable, action, runInAction, toJS } from 'mobx'
import { get, post } from '../../axios/index'
import { FileNode } from './file'
import { monacoService as Monaco } from '../monaco/index'
import { git } from '../git/index'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
class FileSystem {
  @observable baseUrl = ''
  @observable mustRender = 0
  @observable dragFile: FileNode
  @observable loading: boolean = false
  @observable files: any = {
    children: [],
    name: '',
    path: '',
    size: 0,
    type: '',
    errorMessage: ''
  }
  @observable expandFolder = []
  @action setExpandFolder = (expandFolder) => {
    this.expandFolder = expandFolder
  }
  @action setCacheFileValue = (cacheFile, value) => { // 更新内容
    cacheFile.value = value
    this.cacheFiles = [...this.cacheFiles]
  }
  @observable cacheFiles: any = []
  @action setBaseUrl = (baseUrl: string): void => { // 按照路由设置 项目基本信息
    this.baseUrl = baseUrl
    this.files.path = baseUrl
    this.files.name = baseUrl.split('/').pop()
  }
  // @action queryFileStatus = (fileNode) => {
  //   const { stagedChanges, workspaceChanges } = git
  //   return stagedChanges.concat(workspaceChanges).find(_statusFile => {
  //     return _statusFile.path === fileNode.path
  //   })
  // }
  @action refreshWt = async () => { // 渲染状态树
    this.files.children = this.tansformFiles(this.files.children, [])
  }
  @action tansformFiles = (node, level) => { // 数据排序 + 转换
    let dir = node.filter(_item => _item.type === 'directory').sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
    let files = node.filter(_item => _item.type === 'file').sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
    let newNode = dir.concat(files)
    return newNode && newNode.map((fileNode, _index) => {
      fileNode.isOpen = fileNode.isOpen || false
      let gitignores = false // 暂时不做
      let children = null
      if (fileNode.type === 'directory') {
        children = this.tansformFiles(fileNode.children, level.concat(_index))
      }
      let node = new FileNode(fileNode, false, '', gitignores, level.concat(_index), children)
      // const fileStatus = this.queryFileStatus(node)
      // if (fileStatus) {
      //   node.status = node.type === 'file' ? fileStatus.status : '.'
      //   node.color = fileStatus.color
      // }
      return node
    })
  }
  @action getFile = async (path: string) => {// 查询文件
    return await get('/api/file/getfile', {
      path
    })
  }
  @action openFile = async (fileNode: FileNode) => { // 打开文件
    if (!fileNode) { return }
    if (!this.cacheFiles.some(_cacheFile => { // 不在缓存就发送请求
      return _cacheFile.path === fileNode.path && fileNode.diffEditor === _cacheFile.diffEditor
    })) {
      const { isError, data } = await this.getFile(fileNode.path)
      if (isError) {
        console.log(`Open file ${fileNode.name} exception.`)
      } else {
        // 不拷贝一下 会有问题
        runInAction(() => {
          this.cacheFiles.forEach(cacheFile => cacheFile.selected = false) // 清空选中态
          let cacheFile:FileNode = Object.assign({}, fileNode, {
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
    })
  }
  @action closeOther = (node) => {
    if (this.cacheFiles.some(tab => {
      return tab.notSave && node.path !== tab.path
    })) {
      alert('没有保存的')
    } else {
      node.selected = true
      this.cacheFiles = [node]
      Monaco.updateModelOptions() // 更新modelOptions
    }
  }
  @action closeAll = () => {
    if (this.cacheFiles.some(tab => {
      return tab.notSave
    })) {
      alert('未保存的设置')
    } else {
      this.cacheFiles.length = 0
    }
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
  @action queryFiles = async () => {
    this.loading = true
    const { isError, data } = await get('/api/file/filelist', {
      path: this.baseUrl
    })
    if (data === null) {
      runInAction(() => {
        this.files.errorMessage = 'File Path Error.'
        this.loading = false
      })
    }
    if (!isError && data) {
      runInAction(() => {
        this.files = data
        this.refreshWt()
        this.loading = false
      })
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
    console.log('saveCurrentFile')
    this.saveFile(this.queryCurrentNode().path)
  }
  @action saveFile = async (path: string) => {
    const file = this.cacheFiles.find(fileNode => {
      return fileNode.path === path && fileNode.content !== fileNode.editorMonaco.getValue() // 只有文件发生了变化才保存
    })
    if (file) {
      const { isError, error } = await post('/api/file/savefile', {
        path: file.path,
        content: file.editorMonaco.getValue()
      }, {})
      runInAction(async () => {
        if (!isError) {
          file.content = file.editorMonaco.getValue() // 更新节点的content
          await this.toBeSave(false, file)
          await git.queryStatus() // 查询git状态
          await this.refreshWt() // 更新状态树
          // 更新设置
          if (this.baseUrl + '/' + '.vscode/settings.json' === file.path) {
            Monaco.setOptions(file.editorMonaco.getValue())
          } else if (this.baseUrl + '/' + '.vscode/tsconfig.json' === file.path) {
            Monaco.setCompilerOptions(file.editorMonaco.getValue())
          }
        } else {
          console.log(error)
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
    }, isRoot, '', false, [], null)
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
      const { isError } = await post('/api/file/new', {
        path: fileNode.path,
        filename
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
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
      const { isError, error } = await post('/api/file/rename', {
        path,
        oldName: fileNode.name,
        newName
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
        runInAction(() => {
          // 同步已经打开的 cacheFiles
          let cacheFile = this.cacheFiles.find(item => item.path === fileNode.path)
          if (cacheFile) {
            if (fileNode.type === 'directory') {
              let cache = this.cacheFiles.filter(_file => {
                return _file.path.startsWith(fileNode.path)
              })
              let newPath = fileNode.path.substr(0, fileNode.path.lastIndexOf('/')) + '/' + newName // 最新路径
              cache.map(_item => {
                _item.path = newPath + '/' + _item.name
                _item.key = _item.path
              })
              this.cacheFiles = [...this.cacheFiles]
              /** 保持文件夹打开状态 */
              if (this.expandFolder.indexOf(fileNode.path) > -1) {
                this.expandFolder.push(newPath)
              }
            } else {
              FileNode.ReNameNode(newName, cacheFile)
              this.cacheFiles = [...this.cacheFiles]
            }
          }
        })
      } else {
        runInAction(() => {
          fileNode.rename = false
          this.mustRender = Math.random()
          console.log(error)
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
    }, isRoot, '', false, [], [])
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
      const { isError } = await post('/api/file/newfolder', {
        path: fileNode.path,
        foldername
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
      } else {
        console.log(`create folder error.`)
        fileNode.children = fileNode.children.filter(_item => {
          return _item.path !== node.path
        })
      }
    }
    runInAction(() => {
      this.mustRender = Math.random()
    })
  }
  @action deleteFile = async (fileNode) => {
    const { isError, error } = await post('/api/file/delete', {
      path: fileNode.path.substr(0, fileNode.path.lastIndexOf('/')),
      filename: fileNode.name
    }, {})
    if (!isError) {
      this.closeFile(fileNode)
      await git.queryStatus()
      await this.queryFiles()
    } else {
      console.log(error)
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
    let node = new FileNode(fileNode, false, '', false, level, null)
    return node
  }
}
const fileSystem = new FileSystem()
export {
  fileSystem
}