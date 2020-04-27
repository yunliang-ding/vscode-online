import { observable, action, runInAction } from 'mobx'
import { fileSystem } from '../filesystem/index'
import Mapping from '../mapping/index'
import { monacoService } from '../monaco/index'
const { IconMapping, IconColorMapping , LanguageMapping } = Mapping
class Search{
  @observable searchText: string = ''
  @observable replaceText: string = ''
  @observable expand: boolean = false
  @observable searchContent: string = ''
  @observable searchFiles = []
  @observable loading = false
  @observable mustRender = Math.random()
  @observable searchCount = 0
  @action setExpand = (_expand) => {
    this.expand = _expand
  }
  @action expendSearch = (_node) => {
    _node.isOpen = !_node.isOpen
    this.mustRender = Math.random()
  }
  @action collapse = () => {
    this.searchFiles.map(_item => {
      _item.isOpen = false
    })
  }
  @action clearResult = () => {
    this.searchContent = ''
    this.searchFiles = []
    this.searchCount = 0
  }
  @action search = async (searchContent: string) => {
    if(searchContent.trim() === ''){
      console.log('请输入要查询的内容!')
      return 
    }
    this.loading = true
    this.searchCount = 0
    this.searchFiles = []
    let res = await this.findAllMatches(searchContent)
    setTimeout(() => {
      runInAction(() => {
        this.searchFiles = res
        this.loading = false
      })
    }, 2000)
  }
  @action findAllMatches = async (searchString) => {
    let res = []
    if (searchString) {
      monacoService.getModels().forEach(model => {
        let result = model.findMatches(searchString, true, true, true, '', true, 10)
        if (result.length > 0 && model.uri.scheme === 'file') {
          let dir: any = model.uri.path.split('/')
          let name = dir.join('/')
          if (dir.length > 1) {
            name = dir.pop()
          }
          let extension = name.substr(name.lastIndexOf('.'))
          dir = dir.join('/').replace(fileSystem.files.path, '')
          if (dir.startsWith('/')) {
            dir = dir.substr(1)
          }
          this.searchCount += result.length
          const node = {
            key: Math.random(),
            id: model.uri.path,
            path: model.uri.path,
            dir,
            name,
            extension,
            icon: IconMapping[extension],
            iconColor: IconColorMapping[extension],
            type: 'directory',
            isOpen: (result.length < 10) || false,
            prefix: '',
            children: result.map(_item => {
              let label:any = model.getLineContent(_item.range.startLineNumber).trim().toString();
              label = this.highlightText(label, searchString)
              return {
                id: model.uri.path ,
                key: Math.random(),
                path: model.uri.path,
                label,
                name,
                type: 'file',
                level: [],
                prefix: '',
                language: LanguageMapping[extension],
                icon: IconMapping[extension],
                model: model,
                range: _item.range,
                iconColor: IconColorMapping[extension],
              }
            })
          }
          res.push(node)
        }
      })
    }
    return res
  }
  highlightText = (content, search) => {
    let count = 1
    let arr:any = content.split(search)
    let result = arr.map(_item => { 
      return {
        key:false, 
        text:_item,
        uuid: Math.random()
      } 
    })
    result.map((_item:any, _index:number, _arr:any)=>{
      if(_item.text === ""){ //这个原本是关键字
        _item.key = true,
        _item.text = search
      } else { 
        // 满足条件基于追加一项
        if(_index < _arr.length - 1 && _item.key === false){
          _arr.splice(_index + (count++), 0, {
            key: true,
            text: search
          })
        }
      }
    })
    return result
  }
}
const search = new Search()
export {
  search
}