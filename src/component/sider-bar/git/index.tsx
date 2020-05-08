import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Tree, Popover, Loading, Message } from 'react-ryui'
import './index.less'
const Window: any = window
const message = new Message({
  duration: 3,
  dark: Window.config.dark,
  position: 'br'
})
const $: any = document.querySelector.bind(document)
@inject('UI', 'FileSystem', 'Git')
@observer
class Git extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  commit = async (commitInfo: string) => {
    if (this.props.Git.countChange === 0) {
      message.warning(`暂无提交的内容.`)
      return
    }
    if (commitInfo === '') {
      message.warning(`提交信息不能为空.`)
    } else {
      this.props.Git.commitFile(commitInfo)
    }
  }
  workSpaceChangeMenu = (item) => {
    const statusTree = {
      'U': <div className='app-git-menu'>
        <div className='app-git-menu-item' onClick={
          () => {
            this.props.FileSystem.deleteFile(item)
          }
        }>
          <span>删除文件</span>
          <i className='iconfont icon-shanchu'></i>
        </div>
        <div className='app-git-menu-item' onClick={
          () => {
            this.props.Git.addFile(item.path)
          }
        }>
          <span>添加暂存区</span>
          <i className='iconfont icon-jia-copy-copy'></i>
        </div>
      </div>,
      'D': <div className='app-git-menu'>
        <div className='app-git-menu-item' onClick={
          () => {
            this.props.Git.checkoutFile(item.path)
          }
        }>
          <span>恢复文件</span>
          <i className='iconfont icon-chexiao-sys-iconF'></i>
        </div>
        <div className='app-git-menu-item' onClick={
          () => {
            this.props.Git.addFile(item.path)
          }
        }>
          <span>添加暂存区</span>
          <i className='iconfont icon-jia-copy-copy'></i>
        </div>
      </div>,
      'M': <div className='app-git-menu'>
        <div className='app-git-menu-item' onClick={
          () => {
            this.props.Git.checkoutFile(item.path)
          }
        }>
          <span>撤销修改</span>
          <i className='iconfont icon-chexiao-sys-iconF'></i>
        </div>
        <div className='app-git-menu-item' onClick={
          () => {
            this.props.Git.addFile(item.path)
          }
        }>
          <span>添加暂存区</span>
          <i className='iconfont icon-jia-copy-copy'></i>
        </div>
      </div>
    }
    return statusTree[item.status]
  }
  stagedChangeMenu = (item) => {
    return <div className='app-git-menu'>
      <div className='app-git-menu-item' onClick={
        () => {
          this.props.Git.resetFile(item.path)
        }
      }>
        <span>撤销暂存区</span>
        <i className='iconfont icon-chexiao-sys-iconF'></i>
      </div>
    </div>
  }
  renderTreeData = (node, staged) => {
    return node.map(item => {
      let obj: any = {
        key: item.path,
        icon: item.icon,
        iconColor: item.iconColor,
        label: <Popover
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
          dark={Window.config.dark}
          content={staged ? this.stagedChangeMenu(item) : this.workSpaceChangeMenu(item)}
          trigger='contextMenu'
          placement='bottom'
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={
            async () => {
              await this.props.Git.queryStagedText(item)
              await this.props.FileSystem.openFile(item)
            }
          }>
            <div style={{ display: 'flex', alignItems: 'center', width: 'calc(100% - 20px)' }}>
              <span>
                <span style={{ marginRight: 8, opacity: 0.6, textDecoration: item.status === 'D' ? 'line-through' : 'unset' }}>
                  {item.name}
                </span>
                <span>{item.dir}</span>
              </span>
            </div>
            <span style={{ width: 20, textAlign: 'center', color: item.color }}>{item.status}</span>
          </div>
        </Popover>
      }
      return Object.assign({}, item, obj)
    })
  }
  render() {
    const { git: { isGitProject }, workspaceChanges, stagedChanges, loading } = this.props.Git
    const workspaceChangesData = this.renderTreeData(workspaceChanges, false)
    const stagedChangesData = this.renderTreeData(stagedChanges, true)
    let theme = Window.config.dark ? '-dark' : ''
    return <Loading
      style={{ height: '100%', width: '100%' }}
      loading={loading}>
      <div className={`app-git${theme}`}>
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
    </Loading>
  }
}
export { Git }