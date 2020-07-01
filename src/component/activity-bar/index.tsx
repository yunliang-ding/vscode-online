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
  recentlyMenu = () => {
    const {
      openProject, projectList
    } = this.props.UI
    return <div className='app-activity-menu'>
      {
        projectList.map(item => {
          return <div key={item} className='app-activity-menu-item' onClick={
            () => {
              openProject(item)
            }
          }>
            {item}
          </div>
        })
      }
    </div>
  }
  topMenu = () => {
    const {
      setOpenProjectVisabled,
      projectList
    } = this.props.UI
    return <div className='app-activity-menu'>
      <div className='app-activity-menu-item' onClick={
        () => {
          setOpenProjectVisabled(true)
        }
      }>打开项目</div>
      {
        projectList.length > 0 && <div className='app-activity-menu-item'>
          <Popover
            content={this.recentlyMenu()}
            trigger='hover'
            dark={this.props.UI.isDark}
            placement='bottom'
          >
            最近打开的项目
          </Popover>
        </div>
      }
    </div>
  }
  menu = () => {
    const {
      fullScreen,
      setFullScreen,
      setTheme,
      projectList
    } = this.props.UI
    return <div className='app-activity-menu'>
      {
        projectList.length > 0 && <div className='app-activity-menu-item'>
          <Popover
            content={this.recentlyMenu()}
            trigger='hover'
            dark={this.props.UI.isDark}
            placement='right'
          >
            最近打开的项目
          </Popover>
        </div>
      }
      <div className='app-activity-menu-item' onClick={
        () => {
          setFullScreen(!fullScreen)
          if (fullScreen) {
            switchFullScreen().exit()
          } else {
            switchFullScreen().request()
          }
        }
      }>
        <span>{this.props.UI.fullScreen ? '退出全屏' : '全屏模式'}</span>
      </div>
      <div className='app-activity-menu-item' onClick={
        () => {
          setTheme(true)
        }
      }>黑色主题</div>
      <div className='app-activity-menu-item' onClick={
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
            <i title={tab.label} className={`codicon ${tab.icon}`}></i>
            {tab.label === 'Explorer' && <Badge count={this.props.FileSystem.notSaveCount()} />}
            {tab.label === 'Git' && <Badge count={this.props.Git.countChange} />}
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
          <i className='codicon codicon-settings-gear' style={{ fontSize: 24 }}></i>
        </Popover>
      </div>
    </div>
  }
}
export { ActivityBar }