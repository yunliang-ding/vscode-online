import * as React from "react"
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { Tree } from 'ryui'
import './index.less'
const Window: any = window
@inject('UI', 'FileSystem', 'Mapping')
@observer
class Explorer extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  renderExplorer = (node) => {
    return node.map(item => {
      let obj: any = {
        key: item.path,
        label: item.children ? item.name : <div style={{ display: 'flex', alignItem: 'center' }}>
          <i
            className={'iconfont ' + this.props.Mapping.IconMapping[item.extension]}
            style={{ color: this.props.Mapping.IconColorMapping[item.extension], marginRight:8 }}></i>
          <span>{item.name}</span>
        </div>
      }
      if (item.children) {
        obj.children = this.renderExplorer(item.children)
      }
      return obj
    })
  }
  render() {
    const data = this.renderExplorer(toJS(this.props.FileSystem.files.children))
    let theme = Window.config.dark ? '-dark' : ''
    return <div className={`app-explorer${theme}`}>
      <Tree
        style={{
          width: '100%',
          height: '100%'
        }}
        dark={Window.config.dark}
        defaultExpandedKeys={['1', '1-3']}
        defaultCheckedKeys={['1-2']}
        treeData={data}
        onCheck={
          (e, node) => {
            console.log(e, node)
          }
        }
        onExpand={
          (e) => {
            console.log(e)
          }
        }
      />
    </div>
  }
}
export { Explorer }