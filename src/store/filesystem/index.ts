import { observable, action, runInAction, toJS } from 'mobx'
import { get, post } from '../../axios/index'
import { FileNode } from './file'
import { monacoService as Monaco } from '../monaco/index'
import { git } from '../git/index'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
const $: any = document.querySelector.bind(document)
class FileSystem {
  @observable baseUrl = '/home/development/music.163.app/'
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
  @action setBaseUrl = (baseUrl: string): void => { // 按照路由设置 项目基本信息
    this.baseUrl = baseUrl
    this.files.path = baseUrl
    this.files.name = baseUrl.split('/').pop()
  }
  // @action queryFileStatus = (_node) => {
  //   const { stagedChanges, workspaceChanges } = git
  //   return stagedChanges.concat(workspaceChanges).find(_statusFile => {
  //     return _statusFile.path === _node.path
  //   })
  // }
  @action refreshWt = async () => { // 渲染状态树
    this.files.children = this.tansformFiles(this.files.children, [])
  }
  @action tansformFiles = (node, level) => { // 数据排序 + 转换
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
      // const fileStatus = this.queryFileStatus(node)
      // if (fileStatus) {
      //   node.status = node.type === 'file' ? fileStatus.status : '.'
      //   node.color = fileStatus.color
      // }
      return node
    })
  }
  // @action openStagesFile = async () => {
  //   const currentFile = this.cacheFiles.filter(fileNode => {
  //     return fileNode.selected
  //   })[0] || null
  //   let node = { ...currentFile }
  //   if (node.status !== '') {
  //     node.prefix = ' (WorkTree)'
  //     node.id = node.path + node.prefix
  //     node.diffEditor = true
  //     await git.queryStagedText(node)
  //     await this.openFile(node)
  //   }
  // }
  @action getFile = async (path: string) => {// 查询文件
    return await get('/api/file/getfile', {
      path
    })
  }
  @action openFile = async (fileNode: FileNode) => { // 打开文件
    if (!fileNode) { return }
    if (!this.cacheFiles.some(_cacheFile => { // 不在缓存就发送请求
      return _cacheFile.id === fileNode.id
    })) {
      const { isError, data } = await this.getFile(fileNode.path)
      if (isError) {
        console.log(`Open file ${fileNode.name} exception.`)
      } else {
        // 不拷贝一下 会有问题
        runInAction(() => {
          this.cacheFiles.forEach(cacheFile => cacheFile.selected = false) // 清空选中态
          let cacheFile = Object.assign({}, fileNode, {
            content: data,
            selected: true,
            notSave: false
          })
          this.cacheFiles.push(cacheFile)
        })
      }
    } else {
      this.cacheFiles.forEach(item => item.selected = item.id === fileNode.id)
    }
    runInAction(() => {
      this.mustRender = Math.random()
    })
  }
  // @action openSplitPanel = async () => {
  //   const currentFile = this.cacheFiles.filter(fileNode => {
  //     return fileNode.selected
  //   })[0] || null
  //   this.openFile(currentFile)
  // }
  @action closeOther = (node) => {
    if (this.cacheFiles.some(tab => {
      return tab.notSave && node.key !== tab.key
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
  @action closeFile = (fileNode, _index) => {
    this.cacheFiles = this.cacheFiles.filter(file => {
      file.selected = false // 清空选中
      return file.key !== fileNode.key
    })
    this.cacheFiles[0] && (this.cacheFiles[0].selected = true) // 默认选中第一个
  }
  @action toBeSave = (save: boolean, path: string) => {
    this.cacheFiles.forEach(fileNode => {
      if (fileNode.path === path) { // 按照路径匹配
        fileNode.notSave = save
      }
    })
  }
  @action saveFile = async (path: string) => {
    const currentFile = this.cacheFiles.filter(fileNode => {
      return fileNode.path === path && fileNode.content !== fileNode.editorMonaco.getValue() // 只有文件发生了变化才保存
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
        // let currentNode = this.cacheFiles.find(_item => {
        //   return _item.selected
        // })
        // if (currentNode) {
        //   let level = [...currentNode.level]
        //   level.pop()
        //   this.autoOpenDirectory(level)
        // }
        // if (data.children.length === 0) {
        //   this.files.errorMessage = 'Project is Empty.'
        // }
      })
    }
  }
  // @action toLogin = async (username, passward) => {
  //   const res = await get('/api/file/login', {
  //     username,
  //     passward
  //   })
  //   return res
  // }
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
    } else {
      console.log(error)
    }
  }
  /**
   * 获取当前节点等操作
   */
  @action queryCurrentNode = (): FileNode => {
    return this.cacheFiles.find(cacheFile => {
      return cacheFile.selected
    }) || {}
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
    children.some(fileNode => {
      if (fileNode.path === path) {
        fileNode = fileNode
      } else if (fileNode.type === 'directory') {
        fileNode = this.recursionFileNodeByPath(fileNode.children, path)
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
  @observable expandFolder = []
  @action setExpandFolder = (expandFolder) => {
    this.expandFolder = expandFolder
  }
}
const fileSystem = new FileSystem()
export {
  fileSystem
}