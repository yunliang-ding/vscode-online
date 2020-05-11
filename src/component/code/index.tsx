import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Monaco } from '../monaco/index'
import { MonacoDiff } from '../monaco/diff';
import { Tabs, Popover, Modal, Loading } from 'react-ryui'
import './index.less'
@inject('UI', 'FileSystem')
@observer
class Code extends React.Component<any, any> {
  [x: string]: any;
  props: any
  state: any
  fileNode: any
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }
  menu = (item) => {
    return <div className='app-tabs-menu'>
      <div className='app-tabs-menu-item' onClick={
        () => {
          if (item.notSave) {
            this.setState({
              visible: true,
              closeType: 0
            })
          } else {
            this.props.FileSystem.closeFile(item)
          }
        }
      }>
        <span>close</span>
      </div>
      <div className='app-tabs-menu-item' onClick={
        () => {
          if (this.props.FileSystem.cacheFiles.some(tab => {
            return tab.notSave && item.path !== tab.path
          })) {
            this.setState({
              visible: true,
              closeType: 1
            })
          } else {
            this.props.FileSystem.closeOther(item)
          }
        }
      }>
        <span>close other</span>
      </div>
      <div className='app-tabs-menu-item' onClick={
        () => {
          if (this.props.FileSystem.cacheFiles.some(tab => {
            return tab.notSave
          })) {
            this.setState({
              visible: true,
              closeType: 2
            })
          } else {
            this.props.FileSystem.closeAll()
          }
        }
      }>
        <span>close all</span>
      </div>
    </div>
  }
  render() {
    const { tabLoading, cacheFiles, openFile, closeFile, closeOther, closeAll, queryCurrentNode, toBeSave, setCacheFileValue } = this.props.FileSystem
    const currentFile = queryCurrentNode()
    let tabs = cacheFiles.map((item, index) => {
      return Object.assign({}, item, {
        key: item.diffEditor ? item.path + 'diff' : item.path,
        tip: item.path,
        label: <Popover
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', zIndex: 9999 }}
          dark={this.props.UI.isDark}
          content={this.menu(item)}
          trigger='contextMenu'
          placement='bottom'
          onContext={
            () => {
              this.fileNode = cacheFiles[index]
            }
          }
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
            language={item.language}
            key={item.path + 'diff'}
            theme={this.props.UI.isDark ? 'vs-dark' : 'vs-light'}
            original={item.stagedValue}
            value={item.value}
          /> : <Monaco
            path={item.path}
            key={item.path}
            theme={this.props.UI.isDark ? 'vs-dark' : 'vs-light'}
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
    let theme = this.props.UI.isDark ? '-dark' : ''
    return <Loading
      style={{ height: '100%', width: '100%' }}
      loading={tabLoading}>
      <div className={`app-code${theme}`}>
        {
          tabs.length > 0 && <div className='app-code-tools'>
            <i title='Open Changes' className='codicon codicon-compare-changes' onClick={
              () => {
                this.props.FileSystem.openStageFile() // 打开当前选中的git记录
              }
            }></i>
            <i title='More Actions' className='codicon codicon-more'></i>
          </div>
        }
        {
          tabs.length === 0 ? <div className='app-code-none'>
            <i className='iconfont icon-tools'></i>
          </div> : <Tabs
              dark={this.props.UI.isDark}
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
                  this.fileNode = node
                  if (node.notSave) {
                    this.setState({
                      visible: true,
                      closeType: 0
                    })
                  } else {
                    closeFile(node)
                  }
                }
              }
            />
        }
        <Modal
          title="提示"
          closable
          footer={null}
          dark={this.props.UI.isDark}
          mask
          visible={this.state.visible}
          content={
            <div className='explorer-model-delete'>
              <i className='iconfont icon-iconfontcolor100-copy'></i>
              <span>
                还有未保存的文件，是否确认关闭？
            </span>
            </div>
          }
          style={{
            width: 300,
            height: 140
          }}
          onClose={
            () => {
              this.setState({
                visible: false
              })
            }
          }
          onOk={
            () => {
              this.setState({
                visible: false
              }, () => {
                if (this.state.closeType === 0) {
                  closeFile(this.fileNode)
                } else if (this.state.closeType === 1) {
                  closeOther(this.fileNode)
                } else if (this.state.closeType === 2) {
                  closeAll()
                }
              })
            }
          }
        />
      </div>
    </Loading>
  }
}
export { Code }