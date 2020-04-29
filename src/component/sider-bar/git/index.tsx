import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Tree, Popover } from 'ryui'
import './index.less'
const Window: any = window
const $: any = document.querySelector.bind(document)
@inject('UI', 'FileSystem', 'Mapping', 'Git')
@observer
class Git extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  commit = async (commitInfo: string) => {
    if (this.props.Git.countChange === 0) {
      alert(`There's nothing to commit here.`)
      return
    }
    if (commitInfo === '') {
      alert(`commit message not allow empty.`)
    } else {
      // this.props.Git.commitFile(commitInfo)
    }
  }
  menu = (item) => {
    return <div className='app-git-menu'>
      <div className='app-git-menu-item'>
        <span>Restore</span>
        <i className='iconfont icon-rename'></i>
      </div>
      <div className='app-git-menu-item'>
        <span>Delete File</span>
        <i className='iconfont icon-shanchu'></i>
      </div>
    </div>
  }
  renderTreeData = (node) => {
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
            <div style={{ display: 'flex', alignItem: 'center' }}>
              <i className={'iconfont ' + this.props.Mapping.IconMapping[item.extension || item.name]}
                style={{ color: this.props.Mapping.IconColorMapping[item.extension || item.name], marginRight: 8 }}></i>
              <span>
                <span style={{ opacity: 0.6 }}>{item.name}</span>  {item.dir}
              </span>
            </div>
          </div>
        </Popover>
      }
      Object.assign(item, obj)
      return item
    })
  }
  render() {
    const { git: { isGitProject }, workspaceChanges, stagedChanges } = this.props.Git
    const workspaceChangesData = this.renderTreeData(workspaceChanges)
    const stagedChangesData = this.renderTreeData(stagedChanges)
    let theme = Window.config.dark ? '-dark' : ''
    return <div className={`app-git${theme}`}>
      <div className='app-git-header'>
        <div className='app-git-header-left'>
          source control : git
        </div>
        <div className='app-git-header-right'>
          <i title='commit' className='iconfont icon-tijiao' onClick={
            () => {
              this.commit($('#commit-info').value.trim())
            }
          }></i>
          <i title='refresh' className='iconfont icon-shuaxin' onClick={
            () => {
              this.props.Git.queryStatus()
            }
          }></i>
          <i title='push' className='iconfont icon-jsontijiao' onClick={
            () => {
              this.props.Git.pushFile()
            }
          }></i>
        </div>
      </div>
      <div className='app-git-body'>
        <div className='app-git-input'>
          <input autoFocus autoComplete='off' id='commit-info' placeholder='Message (press Enter to commit)' onKeyDown={
            (e: any) => {
              if (e.keyCode === 13) {
                this.commit(e.target.value.trim())
              }
            }
          } />
        </div>
        <div className='app-git-body-change'>
          {
            stagedChangesData.length > 0 && <div className='app-git-body-change-staged'>
              <div className='app-git-body-change-title'>Staged Change</div>
              <Tree
                dark={Window.config.dark}
                treeData={stagedChangesData}
              />
            </div>
          }
          {
            workspaceChangesData.length > 0 && <div className='app-git-body-change-workspace'>
              <div className='app-git-body-change-title'>Change</div>
              <Tree
                dark={Window.config.dark}
                treeData={workspaceChangesData}
              />
            </div>
          }
        </div>
      </div>
    </div>
  }
}
export { Git }