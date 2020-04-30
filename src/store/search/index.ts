import { observable, action, runInAction } from 'mobx'
import { fileSystem } from '../filesystem/index'
import Mapping from '../mapping/index'
import { monacoService } from '../monaco/index'
const { IconMapping, IconColorMapping , LanguageMapping } = Mapping
class Search{
  @observable searchContent: string = ''
  @observable searchFiles = []
  @observable loading = false
  @observable mustRender = Math.random()
  @observable searchCount = 0
  @observable expandFolder: any = []
  @action setExpandFolder = (expandFolder) => {
    this.expandFolder = expandFolder
  }
  @action setSearchContent = (searchContent:string) => {
    this.searchContent = searchContent
  }
  @action clearResult = () => {
    this.searchContent = ''
    this.searchFiles = []
    this.searchCount = 0
  }
  @action search = async (searchContent: string) => {
    if(searchContent.trim() === ''){
      alert('请输入要查询的内容!')
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
    }, 1000)
  }
  @action findAllMatches = async (searchString) => {
    let res = []
    if (searchString) {
      monacoService.getModels().forEach(model => {
        console.log(model)
        let result = model.findMatches(searchString, true, true, true, '', true, 10)
        this.expandFolder.push(model.uri.path) // 自动展开
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
            path: model.uri.path,
            dir,
            name,
            extension,
            icon: IconMapping[extension],
            iconColor: IconColorMapping[extension],
            type: 'directory',
            isOpen: (result.length < 10) || false,
            prefix: '',
            children: result.map(item => {
              let label:any = model.getLineContent(item.range.startLineNumber).trim().toString();
              label = this.highlightText(label, searchString)
              return {
                path: model.uri.path,
                label,
                name,
                type: 'file',
                level: [],
                prefix: '',
                diffEditor: false,
                language: LanguageMapping[extension],
                icon: IconMapping[extension],
                model: model,
                range: item.range,
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
    let result = arr.map(item => { 
      return {
        key:false, 
        text:item,
        uuid: Math.random()
      } 
    })
    result.map((item:any, _index:number, _arr:any)=>{
      if(item.text === ""){ //这个原本是关键字
        item.key = true,
        item.text = search
      } else { 
        // 满足条件基于追加一项
        if(_index < _arr.length - 1 && item.key === false){
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