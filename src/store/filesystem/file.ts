import Mapping from "../mapping/index";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
const { IconColorMapping, IconMapping, LanguageMapping } = Mapping
class FileNode{
  id:string // 节点唯一标识
  path: string // 节点对应的文件路径
  extension: string // 节点后缀
  name: string // 节点文件名
  dir:string // 文件对应的目录
  isRoot:boolean // 文件是否在根节点
  label:string // 文件查找之后显示的内容
  size: number // 节点文件大小
  rename: boolean // 节点是否在重命名
  newFile: boolean // 节点是是新建文件
  newFolder: boolean // 节点是是新建目录
  prefix: string // 区分文件状态 ['WorkTree'] ..前缀
  gitignore:boolean //节点是否别git忽略
  type:string // 节点是目录还是文件
  isOpen:boolean // 节点是否处于展开状态
  children: any // 节点的孩子 目录类型才会有
  status: string // 对应文件的 git status
  diffEditor: boolean // 是否对比的形式打开
  level: any // 该节点对应的层级关系
  language:string // 节点对应的语言
  color:string // 节点对应的颜色
  icon:string // 节点对应的icon
  iconColor:string // 节点对应的icon颜色
  iconFontSize:number // 节点对应的icon字体大小
  range:any // 查找的范围
  model:any // 文件对应的 monaco Model
  editorMonaco: monaco.editor.IStandaloneCodeEditor // 文件对应的 monaco editor
  diffEditorMonaco: monaco.editor.IStandaloneDiffEditor // 文件对应的 monaco editor diff
  content: string;
  selected: boolean;
  notSave: boolean;
  constructor(node:any, isRoot:boolean, prefix:string ,gitignore:boolean, level:any, children:any){
    this.id = node.path + prefix // 节点唯一标识
    this.path=  node.path // 节点对应的文件路径
    this.extension= node.extension // 节点后缀
    this.name = node.name // 节点文件名
    this.size = node.size // 节点文件大小
    this.type = node.type // 节点是目录还是文件
    this.isOpen = node.isOpen // 节点是否处于展开状态
    /** default value */
    this.dir = '' // 文件对应的目录
    this.isRoot = isRoot // 文件是否在根节点
    this.label =  '' // 文件查找之后显示的内容
    this.rename = false // 节点是否在重命名
    this.newFile = false // 节点是是新建文件
    this.newFolder = false // 节点是是新建目录
    this.prefix = prefix // 区分文件状态 ['WorkTree'] ..前缀
    this.gitignore = gitignore //节点是否别git忽略
    this.children = children // 节点的孩子 目录类型才会有
    this.status =  ''// 对应文件的 git status
    this.diffEditor = false// 是否对比的形式打开
    this.level = level // 该节点对应的层级关系
    this.language = LanguageMapping[node.extension || node.name] // 节点对应的语言
    this.color = '' // 节点对应的颜色
    this.icon = node.type === 'directory' ? (node.isOpen ? 'icon-expand': 'icon-collapse') : IconMapping[node.extension || node.name] // 节点对应的icon
    this.iconColor = IconColorMapping[node.extension || node.name] // 节点对应的icon颜色
    this.iconFontSize = 16 // 节点对应的icon字体大小
    this.range = null // 查找的范围
    this.model = null // 文件对应的 monaco Model
    this.editorMonaco = node.editorMonaco || null // 文件对应的 monaco editor
    this.diffEditorMonaco = null // 文件对应的 monaco editor
    this.content = ''
    this.selected = false
    this.notSave = false
  }
  reName(newName:string){
    let extension = newName.split('.')[1] || ''
    this.extension = '.' + extension
    this.path = this.path.substr(0, this.path.lastIndexOf('/')) + '/' + newName
    this.id = this.path + this.prefix
    this.name = newName
    this.language = LanguageMapping[this.extension || newName] // 节点对应的语言
    this.icon = this.type === 'directory' ? (this.isOpen ? 'icon-expand': 'icon-collapse') : IconMapping[this.extension || newName] // 节点对应的icon,
    this.iconColor = IconColorMapping[this.extension || newName] // 节点对应的icon颜色,
  }
  static ReNameNode(newName:string, node){
    let extension = newName.split('.')[1] || ''
    node.extension = '.' + extension
    node.path = node.path.substr(0, node.path.lastIndexOf('/')) + '/' + newName
    node.id = node.path + node.prefix
    node.name = newName
    node.language = LanguageMapping[node.extension || newName] // 节点对应的语言
    node.icon = node.type === 'directory' ? (node.isOpen ? 'icon-expand': 'icon-collapse') : IconMapping[node.extension || newName] // 节点对应的icon,
    node.iconColor = IconColorMapping[node.extension || newName] // 节点对应的icon颜色,
  }
}
export {
  FileNode
}