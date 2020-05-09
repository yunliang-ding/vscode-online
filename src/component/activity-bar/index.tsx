import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Badge, Popover } from 'react-ryui'
import { switchFullScreen } from './switchFullScreen'
import './index.less'
@inject('UI', 'Git', 'FileSystem')
@observer
class ActivityBar extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  menu = () => {
    const {
      fullScreen,
      setFullScreen,
      setTheme,
    } = this.props.UI
    return <div className='app-activity-menu'>
      <div onClick={
        () => {
          setFullScreen(!fullScreen)
          if(fullScreen){
            switchFullScreen().exit()
          } else {
            switchFullScreen().request()
          }
        }
      }>
        <span>{this.props.UI.fullScreen ? '退出全屏' : '全屏模式'}</span>
      </div>
      <div onClick={
        () => {
          setTheme(true)
        }
      }>黑色主题</div>
      <div onClick={
        () => {
          setTheme(false)
        }
      }>白色主题</div>
    </div>
  }
  render() {
    let theme = this.props.UI.isDark ? '-dark' : ''
    const {
      currentTab,
      tabList,
      setCurrentTab
    } = this.props.UI
    return <div className={`app-activity-bar${theme}`}>
      {
        tabList.map(tab => {
          return <div
            className={tab.label === currentTab ? 'app-activity-bar-item-active' : 'app-activity-bar-item'}
            key={tab.label}
            onMouseDown={
              () => {
                setCurrentTab(tab.label)
              }
            }
          >
            <i title={tab.label} className={`iconfont ${tab.icon}`}></i>
            { tab.label === 'Explorer' && <Badge count={this.props.FileSystem.notSaveCount()} /> }
            { tab.label === 'Git' && <Badge count={this.props.Git.countChange} /> }
          </div>
        })
      }
      <div className='app-full-screen'>
        <Popover
          content={this.menu()}
          trigger='click'
          dark={this.props.UI.isDark}
          placement='top'
        >
          <i className='iconfont icon-config1'></i>
        </Popover>
      </div>
    </div>
  }
}
export { ActivityBar }