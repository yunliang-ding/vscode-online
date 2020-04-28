import * as React from "react"
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { Tree, Popover } from 'ryui'
import './index.less'
const Window: any = window
@inject('UI', 'FileSystem', 'Mapping')
@observer
class Explorer extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  menu = (item) => {
    let arr = [
      <div className='app-explorer-menu-item'>
        <span>Rename</span>
        <i className='iconfont icon-rename'></i>
      </div>,
      <div className='app-explorer-menu-item'>
        <span>Delete File</span>
        <i className='iconfont icon-shanchu'></i>
      </div>
    ]
    if(item.type !== 'file'){
      arr.unshift(
        <div className='app-explorer-menu-item'>
          <span>New File</span>
          <i className='iconfont icon-tianjiawenjian'></i>
        </div>,
        <div className='app-explorer-menu-item'>
          <span>New Folder</span>
          <i className='iconfont icon-jiemu_jiemu_tianjiawenjianjia'></i>
        </div>
      )
    }
    return <div className='app-explorer-menu'>
      {
        arr
      }
    </div>
  }
  renderExplorer = (node) => {
    return node.map(item => {
      let obj: any = {
        key: item.path,
        label: <Popover
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
          dark={Window.config.dark}
          content={this.menu(item)}
          trigger='contextMenu'
          placement='bottom'
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }} onClick={
            () => {
              item.type === 'file' && this.props.FileSystem.openFile(item)
            }
          }>
            {
              item.children ? item.name : <div style={{ display: 'flex', alignItem: 'center' }}>
                <i
                  className={'iconfont ' + this.props.Mapping.IconMapping[item.extension || item.name]}
                  style={{ color: this.props.Mapping.IconColorMapping[item.extension || item.name], marginRight: 8 }}></i>
                <span>{item.name}</span>
              </div>
            }
          </div>
        </Popover>
      }
      if (item.children) {
        obj.children = this.renderExplorer(item.children)
      }
      Object.assign(item, obj)
      return item
    })
  }
  render() {
    const { cacheFiles, expandFolder, setExpandFolder, files: { children, name} } = this.props.FileSystem
    const data = this.renderExplorer(toJS(children))
    let theme = Window.config.dark ? '-dark' : ''
    let currentFile = cacheFiles.find(item => item.selected) || {}
    console.log('render')
    return <div className={`app-explorer${theme}`}>
      <div className='app-explorer-header'>
        <div className='app-explorer-header-left'>
          explorer: {name}
        </div>
        <div className='app-explorer-header-right'>
          <i className='iconfont icon-tianjiawenjian'></i>
          <i className='iconfont icon-jiemu_jiemu_tianjiawenjianjia'></i>
          <i className='iconfont icon-shuaxin'></i>
          <i className='iconfont icon-zhankai'></i>
        </div>
      </div>
      <div className='app-explorer-body'>
        <Tree
          style={{
            width: '100%',
            height: '100%'
          }}
          dark={Window.config.dark}
          defaultExpandedKeys={expandFolder}
          defaultCheckedKeys={[currentFile.key]}
          treeData={data}
          onExpand={
            (e) => {
              setExpandFolder(e)
            }
          }
        />
      </div>
    </div>
  }
}
export { Explorer }