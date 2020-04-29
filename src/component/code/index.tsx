import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Monaco } from '../monaco/index'
import { Tabs, Popover } from 'ryui'
import { toJS } from 'mobx'
import './index.less'
const Window: any = window
@inject('UI', 'Mapping', 'FileSystem')
@observer
class Code extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  menu = (item) => {
    return <div className='app-tabs-menu'>
      <div className='app-tabs-menu-item' onClick={
        () => {
          this.props.FileSystem.closeFile(item)
        }
      }>
        <span>close</span>
      </div>
      <div className='app-tabs-menu-item' onClick={
        () => {
          this.props.FileSystem.closeOther(item)
        }
      }>
        <span>close other</span>
      </div>
      <div className='app-tabs-menu-item' onClick={this.props.FileSystem.closeAll}>
        <span>close all</span>
      </div>
    </div>
  }
  render() {
    const { cacheFiles, openFile, closeFile, queryCurrentNode, toBeSave, setCacheFileValue } = this.props.FileSystem
    const currentFile = queryCurrentNode()
    let tabs = cacheFiles.map(item => {
      return Object.assign({}, item, {
        key: item.key,
        label: <Popover
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', zIndex: 9999 }}
          dark={Window.config.dark}
          content={this.menu(item)}
          trigger='contextMenu'
          placement='bottom'
        >
          <i className={'iconfont ' + this.props.Mapping.IconMapping[item.extension || item.name]}
            style={{ color: this.props.Mapping.IconColorMapping[item.extension || item.name], marginRight: 8 }}
          ></i>
          <span>{item.name}</span>
          {
            item.notSave && <i className='iconfont icon-dian' style={{ color: '#fff' }}></i>
          }
        </Popover>,
        content: <Monaco
          visabled
          path={item.path}
          theme={Window.config.dark ? 'vs-dark' : 'vs-light'}
          language={this.props.Mapping.LanguageMapping[item.extension || item.name]}
          value={item.value}
          onChange={
            (value) => {
              setCacheFileValue(item, value) // 同步内容
              toBeSave(value !== item.content, item)
            }
          }
        />
      })
    })
    let theme = Window.config.dark ? '-dark' : ''
    return <div className={`app-code${theme}`}>
      <Tabs
        dark={Window.config.dark}
        dataList={tabs}
        activeKey={currentFile.key}
        close
        onClick={
          (node) => {
            openFile(node)
          }
        }
        onRemove={
          (node) => {
            closeFile(node)
          }
        }
      />
    </div>
  }
}
export { Code }