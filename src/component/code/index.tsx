import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Monaco } from '../monaco/index'
import { MonacoDiff } from '../monaco/diff';
import { Tabs, Popover } from 'ryui'
import { toJS } from 'mobx'
import './index.less'
const Window: any = window
@inject('UI', 'FileSystem')
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
        key: item.diffEditor ? item.path + 'diff' : item.path,
        tip: item.path,
        label: <Popover
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', zIndex: 9999 }}
          dark={Window.config.dark}
          content={this.menu(item)}
          trigger='contextMenu'
          placement='bottom'
        >
          <i className={'iconfont ' + item.icon}
            style={{ color: item.iconColor, marginRight: 8 }}
          ></i>
          <span>{item.name + item.prefix}</span>
          {
            item.notSave && <i className='iconfont icon-dian' style={{ color: '#fff' }}></i>
          }
        </Popover>,
        content: item.diffEditor
          ? <MonacoDiff
            visabled
            language={item.language}
            theme={Window.config.dark ? 'vs-dark' : 'vs-light'}
            original={item.stagedValue}
            value={item.value}
          /> : <Monaco
            visabled
            path={item.path}
            theme={Window.config.dark ? 'vs-dark' : 'vs-light'}
            language={item.language}
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
      {
        tabs.length === 0 ? <div className='app-code-none'>
          <i className='iconfont icon-tools'></i>
        </div> : <Tabs
            dark={Window.config.dark}
            dataList={tabs}
            activeKey={currentFile.diffEditor ? currentFile.path + 'diff' : currentFile.path}
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
      }
    </div>
  }
}
export { Code }