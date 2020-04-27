import { observable, action, runInAction, toJS } from 'mobx'
import { get, post } from '../../axios/index'
import { FileNode } from './file'
import { monacoService as Monaco } from '../monaco/index'
import { git } from '../git/index'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
const $: any = document.querySelector.bind(document)
class FileSystem{
  @observable baseUrl = ''
  @observable mustRender = 0
  @observable loadstate = false
  @observable storageLoading = false
  @observable dragFile: FileNode
  @observable files: any = {
    children: [],
    name: '',
    path: '',
    size: 0,
    type: '',
    errorMessage: ''
  }
  @observable cacheFiles: any = []
  @action setBaseUrl = (baseUrl: string): void => {
    this.baseUrl = baseUrl
    this.files.path = baseUrl
    this.files.name = baseUrl.split('/').pop()
    this.setWebTitle(`${this.files.name} - cc-studio`)
  }
  @action setDragFile = (dragFile: FileNode): void => {
    this.dragFile = dragFile
  }
  @action switchCacheFiles = (startIndex: number, endIndex: number): void => {
    this.cacheFiles.splice(
      startIndex,
      1,
      ...this.cacheFiles.splice(
        endIndex,
        1,
        this.cacheFiles[startIndex]
      )
    )
  }
  @action queryFileStatus = (_node) => {
    const { stagedChanges, workspaceChanges } = git
    return stagedChanges.concat(workspaceChanges).find(_statusFile => {
      return _statusFile.path === _node.path
    })
  }
  @action refreshWt = async () => {
    this.files.children = this.tansformFiles(this.files.children, [])
  }
  @action tansformFiles = (node, level) => {
    let dir = node.filter(_item => _item.type === 'directory').sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
    let files = node.filter(_item => _item.type === 'file').sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1 })
    let newNode = dir.concat(files)
    return newNode && newNode.map((_node, _index) => {
      _node.isOpen = _node.isOpen || false
      let gitignores = git.gitignores.includes(_node.path.replace(this.files.path + '/', '') + '/')
      let children = null
      if (_node.type === 'directory') {
        children = this.tansformFiles(_node.children, level.concat(_index))
      }
      let node = new FileNode(_node, false, '', gitignores, level.concat(_index), children)
      const fileStatus = this.queryFileStatus(node)
      if(fileStatus){
        node.status = node.type === 'file' ? fileStatus.status : '.'
        node.color = fileStatus.color
      }
      return node
    })
  }
  @action openDirectory = async (level) => { // 按照层级打开指定目录
    let fileNode = this.files
    level.map(_level => {
      fileNode = fileNode.children[_level]
    })
    fileNode.isOpen = !fileNode.isOpen
    fileNode.icon = fileNode.isOpen ? 'icon-expand' : 'icon-collapse'
    this.files = { ...this.files }
  }
  @action closeAllDirectory = (fileNode) => { // 收起项目
    return fileNode && fileNode.map(_fileNode => {
      _fileNode.type === 'directory' && (
        _fileNode.isOpen = false,
        _fileNode.children = this.closeAllDirectory(_fileNode.children),
        _fileNode.icon = 'icon-collapse'
      )
      return _fileNode
    })
  }
  @action collapseExplorer = () => { // 收起项目
    this.files.children = this.closeAllDirectory(this.files.children)
    this.files = { ...this.files }
  }
  @action autoOpenDirectory = async (level) => { //  自动按照层级展开
    let obj = this.files
    level.map(_level => {
      obj = obj.children[_level]
      obj.isOpen = true
      obj.icon = 'icon-expand'
    })
    this.files = { ...this.files }
  }
  @action openStagesFile = async () => {
    const currentFile = this.cacheFiles.filter(_fileNode => {
      return _fileNode.selected
    })[0] || null
    let node = { ...currentFile }
    if (node.status !== '') {
      node.prefix = ' (WorkTree)'
      node.id = node.path + node.prefix
      node.diffEditor = true
      await git.queryStagedText(node)
      await this.openFile(node)
    }
  }
  @action getFile = async (path: string) => {// 查询文件
    return await get('/api/file/getfile', {
      path
    })
  }
  @action openFile = async (_fileNode: FileNode) => { // 打开文件
    if(!_fileNode){
      return
    }
    let res = {
      isError: true,
      data: ''
    }
    if (!this.cacheFiles.some(_cacheFile => { // 不在缓存就发送请求
      return _cacheFile.id === _fileNode.id
    })) {
      res = await this.getFile(_fileNode.path)
      if (res.isError) {
        console.log(`Open file ${_fileNode.name} exception.`)
      } else {
        // 不拷贝一下 会有问题
        runInAction(() => {
          let cacheFile = Object.assign({}, _fileNode, {
            content: res.data,
            selected: true,
            notSave: false,
            key: Math.random() // monaco 唯一的key
          })
          this.cacheFiles.push(cacheFile)
          this.cacheFiles.forEach(_cacheFile => { // 选中当前
            _cacheFile.selected = _cacheFile.id === _fileNode.id
          })
        })
      }
    } else {
      let _cacheFile = this.cacheFiles.find(_tab => { // 找到这个已经打开的节点
        return _tab.path === _fileNode.path
      })
      let cacheFile = { ..._cacheFile } // simple deep
      let find = this.cacheFiles.find(_tab => { // 判断是否已经在普通类型中打开
        return _tab.id === _fileNode.id
      })
      if (find === undefined) { // 没有就添加一个到普通
        cacheFile.key = Math.random()
        cacheFile.selected = true
        this.cacheFiles.push(cacheFile)
      }
      this.cacheFiles.forEach(_cacheFile => { // 选中当前
        _cacheFile.selected = _cacheFile.id === _fileNode.id
      })
    }
    runInAction(() => {
      // 自动展开父节点的文件夹
      let level = [..._fileNode.level || []]
      level.pop()
      this.autoOpenDirectory(level)
      this.mustRender = Math.random()
      Monaco.updateModelOptions() // 更新modelOptions
      setTimeout(() => {
        this.autoScrollToSelectNode() // 自动定位到当前文件位置
      }, 100)
    })
  }
  @action autoScrollToSelectNode = () => {
    let selectNode = $('.app-explorer-files-node-selected')
    let filesNode = $('.app-explorer-files')
    if (selectNode && filesNode) {
      if (
        filesNode.scrollTop > selectNode.offsetTop ||
        selectNode.offsetTop > filesNode.clientHeight
      ) {
        filesNode.scrollTop = selectNode.offsetTop
      }
    }
  }
  @action openSplitPanel = async () => {
    const currentFile = this.cacheFiles.filter(_fileNode => {
      return _fileNode.selected
    })[0] || null
    this.openFile(currentFile)
  }
  @action setWebTitle = (title: string) => {
    $('#title').innerHTML = title
  }
  @action closeOther = (_index) => {
    if (this.cacheFiles.some((_tab, index) => {
      return _tab.notSave && _index !== index
    })) {
      console.log('有没有保存的')
    } else {
      this.cacheFiles = [this.cacheFiles[_index]]
      this.openFile(this.cacheFiles[_index])
      Monaco.updateModelOptions() // 更新modelOptions
    }
  }
  @action closeAll = () => {
    if (this.cacheFiles.some(_tab => {
      return _tab.notSave
    })) {
      console.log('有未保存的设置')
    } else {
      this.cacheFiles.length = 0
    }
  }
  @action closeFile = (_closeFile, _index) => {
    // 关闭文件
  }
  @action toBeSave = (save: boolean, path: string) => {
    this.cacheFiles.forEach(_fileNode => {
      if (_fileNode.path === path) { // 按照路径匹配
        _fileNode.notSave = save
      }
    })
  }
  @action saveFile = async (path: string) => {
    const currentFile = this.cacheFiles.filter(_fileNode => {
      return _fileNode.path === path && _fileNode.content !== _fileNode.editorMonaco.getValue() // 只有文件发生了变化才保存
    })
    let file = currentFile[0]
    if (file) {
      const { isError, error } = await post('/api/file/savefile', {
        path: file.path,
        content: file.editorMonaco.getValue()
      }, {})
      runInAction(async () => {
        if (!isError) {
          file.content = file.editorMonaco.getValue() // 更新节点的content
          if (currentFile[1]) {
            currentFile[1].content = file.editorMonaco.getValue()
          }
          await this.toBeSave(false, file.path)
          await git.queryStatus()
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
  @action queryFiles = async () => {
    const { isError, data } = await get('/api/file/filelist', {
      path: this.baseUrl
    })
    if (data === null) {
      console.log(`query path: ${this.baseUrl} error.`)
      runInAction(() => {
        this.files.errorMessage = 'File Path Error.'
      })
    }
    if (!isError && data) {
      runInAction(() => {
        this.files = data
        this.refreshWt()
        let currentNode = this.cacheFiles.find(_item => {
          return _item.selected
        })
        if (currentNode) {
          let level = [...currentNode.level]
          level.pop()
          this.autoOpenDirectory(level)
        }
        if (data.children.length === 0) {
          this.files.errorMessage = 'Project is Empty.'
        }
      })
    }
  }
  @action toLogin = async (username, passward) => {
    const res = await get('/api/file/login', {
      username,
      passward
    })
    return res
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
    node.id = Math.random().toString(),
      fileNode.children.push(node)
    this.mustRender = Math.random()
  }
  @action newFileSave = async (_node, node, filename) => {
    if (filename === '') {
      _node.children = _node.children.filter(_item => {
        return _item.id !== node.id
      })
    } else {
      const { isError } = await post('/api/file/new', {
        path: _node.path,
        filename
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
        _node.level && await this.autoOpenDirectory(_node.level)
      }
    }
    runInAction(() => {
      this.mustRender = Math.random()
    })
  }
  @action renameFileTobe = async (_node) => {
    _node.rename = true
    this.mustRender = Math.random()
  }
  @action renameSave = async (pNode, _node, newName) => {
    if (newName === '' || _node.name === newName) {
      _node.rename = false
      this.mustRender = Math.random()
    } else {
      const { isError, error } = await post('/api/file/rename', {
        path: pNode.path,
        oldName: _node.name,
        newName
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
        pNode.level && await this.autoOpenDirectory(pNode.level)
        runInAction(() => {
          // 同步已经打开的 cacheFiles
          if (_node.type === 'directory') {
            let cache = this.cacheFiles.filter(_file => {
              return _file.path.startsWith(_node.path)
            })
            cache.map(_item => {
              // 修改路径
              let behindPath = _item.path.substr(_node.path.length) // 分割得到后面的路径
              let frontPath = _node.path.substr(0, _node.path.lastIndexOf('/')) + '/' + newName
              _item.path = frontPath + behindPath
              _item.id = _item.path
            })
          } else {
            let cacheFile = this.cacheFiles.filter(_file => {
              return _file.id === _node.id
            })
            cacheFile[0] && FileNode.ReNameNode(newName, cacheFile[0])
          }
        })
      } else {
        runInAction(() => {
          _node.rename = false
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
    node.newFile = true
    node.id = Math.random().toString()
    node.icon = 'icon-collapse'
    fileNode.children.push(node)
    this.mustRender = Math.random()
  }
  @action newFolderSave = async (_node, node, foldername) => {
    if (foldername === '') {
      _node.children = _node.children.filter(_item => {
        return _item.id !== node.id
      })
    } else {
      const { isError } = await post('/api/file/newfolder', {
        path: _node.path,
        foldername
      }, {})
      if (!isError) {
        await git.queryStatus()
        await this.queryFiles()
        _node.level && await this.autoOpenDirectory(_node.level)
      } else {
        console.log(`create folder error.`)
        _node.children = _node.children.filter(_item => {
          return _item.id !== node.id
        })
      }
    }
    runInAction(() => {
      this.mustRender = Math.random()
    })
  }
  @action deleteFile = async (_node, filename, fileId) => {
    const { isError, error } = await post('/api/file/delete', {
      path: _node.path,
      filename
    }, {})
    if (!isError) {
      /**
       * 同步 close cacheFile
       */
      runInAction(() => {
        let _closeFile, _index
        this.cacheFiles.map((_item, _index) => {
          if (_item.id === fileId) {
            _closeFile = _item
            _index = _index
          }
        })
        _closeFile && this.closeFile(_closeFile, _index)
      })
      await git.queryStatus()
      await this.queryFiles()
      _node.level && await this.autoOpenDirectory(_node.level)
    } else {
      console.log(error)
    }
  }
  /**
   * 获取当前节点等操作
   */
  @action queryCurrentNode = (): FileNode => {
    return this.cacheFiles.find(_cacheFile => {
      return _cacheFile.selected
    })
  }
  @action getFileNodeEditorMonaco = (): monaco.editor.IStandaloneCodeEditor => {
    const editor: FileNode = this.queryCurrentNode()
    return editor && editor.editorMonaco || null
  }
  @action setFileNodeEditorMonacoByPath = (editorMonaco: monaco.editor.IStandaloneCodeEditor, path: string) => {
    const editor: any = this.cacheFiles.filter(_cacheFile => {
      return _cacheFile.path === path
    })
    editor.map(_editor => {
      _editor.editorMonaco = editorMonaco
    })
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
    let _node = {
      prefix: '',
      id: path + '', // 节点唯一标识
      path, // 节点对应的文件路径
      extension: path.substring(path.lastIndexOf(".")), // 节点后缀
      name: path.substring(path.lastIndexOf("/") + 1), // 节点文件名
      size: '', // 节点文件大小
      type: 'file', // 节点是目录还是文件
      isOpen: false, // 节点是否处于展开状态
      status,
    }
    let node = new FileNode(_node, false, '', false, level, null)
    return node
  }
  @action recursionFileNodeByPath = (children, path: string): FileNode => {
    let fileNode: FileNode = null
    children.some(_fileNode => {
      if (_fileNode.path === path) {
        fileNode = _fileNode
      } else if (_fileNode.type === 'directory') {
        fileNode = this.recursionFileNodeByPath(_fileNode.children, path)
      }
      return Boolean(fileNode)
    })
    return fileNode
  }
  /**
   * 查询该项目文件并打开
   */
  @action queryFileNodeByPath = (path: string): FileNode => {
    return this.recursionFileNodeByPath(this.files.children, path)
  }
}
const fileSystem = new FileSystem()
export {
  fileSystem
}