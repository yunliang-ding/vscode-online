import * as React from "react"
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { Tree, Popover, Loading } from 'react-ryui'
import './index.less'
const Window: any = window
const $: any = document.querySelector.bind(document)
@inject('UI', 'FileSystem', 'Mapping')
@observer
class Explorer extends React.Component<any, any> {
  props: any
  folder: any
  constructor(props) {
    super(props)
  }
  componentDidUpdate() {
    $('#renameing') && $('#renameing').select()
  }
  menu = (item) => {
    let arr = [
      <div className='app-explorer-menu-item' onClick={
        () => {
          this.props.FileSystem.renameFileTobe(item)
        }
      }>
        <span>Rename</span>
        <i className='iconfont icon-rename'></i>
      </div>,
      <div className='app-explorer-menu-item' onClick={
        () => {
          this.props.FileSystem.deleteFile(item)
        }
      }>
        <span>Delete File</span>
        <i className='iconfont icon-shanchu'></i>
      </div>
    ]
    if (item.type !== 'file') {
      arr.unshift(
        <div className='app-explorer-menu-item' onClick={
          () => {
            this.props.FileSystem.newFileTobe(item)
          }
        }>
          <span>New File</span>
          <i className='iconfont icon-tianjiawenjian'></i>
        </div>,
        <div className='app-explorer-menu-item' onClick={
          () => {
            this.props.FileSystem.newFolderTobe(item)
          }
        }>
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
  renderNode = (item) => {
    if (item.newFile || item.newFolder) { // 新建文件或者文件夹
      return <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <input
          autoFocus
          autoComplete='off'
          style={{
            background: '#444',
            width: '100%',
            height: 20,
            color: '#fff',
            outline: 'none',
            border: '1px solid var(--theme-color)'
          }}
          onKeyDown={
            (e: any) => {
              if (e.keyCode === 13) {
                if (item.type === 'file') {
                  this.props.FileSystem.newFileSave(
                    item.isRoot ? this.props.FileSystem.files : this.folder,
                    item,
                    e.target.value.trim()
                  )
                } else if (item.type === 'directory') {
                  this.props.FileSystem.newFolderSave(
                    item.isRoot ? this.props.FileSystem.files : this.folder,
                    item,
                    e.target.value.trim()
                  )
                }
              }
            }
          } onBlur={
            (e: any) => {
              if (item.type === 'file') {
                this.props.FileSystem.newFileSave(
                  item.isRoot ? this.props.FileSystem.files : this.folder,
                  item,
                  e.target.value.trim()
                )
              } else if (item.type === 'directory') {
                this.props.FileSystem.newFolderSave(
                  item.isRoot ? this.props.FileSystem.files : this.folder,
                  item,
                  e.target.value.trim()
                )
              }
            }
          }
        />
      </div>
    } else if (item.rename) {
      return <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <input
          autoFocus
          autoComplete='off'
          defaultValue={item.name}
          id='renameing'
          onClick={
            (e) => {
              e.stopPropagation()
            }
          }
          style={{
            background: '#444',
            width: '100%',
            height: 20,
            color: '#fff',
            outline: 'none',
            border: '1px solid var(--theme-color)'
          }}
          onKeyDown={
            (e: any) => {
              if (e.keyCode === 13) {
                let path = item.path.substr(0, item.path.lastIndexOf('/'))
                this.props.FileSystem.renameSave(path, item, e.target.value.trim())
              }
            }
          } onBlur={
            (e: any) => {
              let path = item.path.substr(0, item.path.lastIndexOf('/'))
              this.props.FileSystem.renameSave(path, item, e.target.value.trim())
            }
          } />
      </div>
    }
    return <span style={{marginLeft: 4}}>{item.name}</span>
  }
  renderExplorer = (node) => {
    return node.map(item => {
      let obj: any = {
        key: item.path,
        icon:item.icon,
        iconColor: item.iconColor,
        label: <Popover
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
          dark={Window.config.dark}
          content={this.menu(item)}
          trigger='contextMenu'
          placement='bottom'
          onContext={
            () => {
              this.folder = item
            }
          }
        >
          <div
            title={item.path + ' (' + Math.ceil(item.size / 1024) + 'kb)'}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: item.color
            }} onClick={
              () => {
                item.type === 'file' && this.props.FileSystem.openFile(item)
              }
            }>
            {
              this.renderNode(item)
            }
            {
              item.status && <div style={{
                color: item.color,
                width: 20,
                textAlign: 'center'
              }}>{item.status}</div>
            }
          </div>
        </Popover>
      }
      if (item.children) {
        obj.children = this.renderExplorer(item.children)
      }
      return Object.assign({}, item, obj)
    })
  }
  render() {
    const { cacheFiles, expandFolder, setExpandFolder, files: { children, name }, loading, queryFiles, mustRender } = this.props.FileSystem
    const data = this.renderExplorer(toJS(children))
    let theme = Window.config.dark ? '-dark' : ''
    let currentFile = cacheFiles.find(item => item.selected) || {}
    return <Loading
      style={{ height: '100%', width: '100%' }}
      loading={loading}>
      <div className={`app-explorer${theme}`}>
        <div className='app-explorer-header'>
          <div className='app-explorer-header-left'>
            explorer: {name}
          </div>
          <div className='app-explorer-header-right'>
            <i className='iconfont icon-tianjiawenjian' onClick={
              () => {
                this.props.FileSystem.newFileTobe(this.props.FileSystem.files, true)
              }
            }></i>
            <i className='iconfont icon-jiemu_jiemu_tianjiawenjianjia' onClick={
              () => {
                this.props.FileSystem.newFolderTobe(this.props.FileSystem.files, true)
              }
            }></i>
            <i className='iconfont icon-shuaxin' onClick={
              () => {
                queryFiles()
              }
            }></i>
            <i className='iconfont icon-zhankai' onClick={
              () => {
                setExpandFolder([])
              }
            }></i>
          </div>
        </div>
        <div className='app-explorer-body'>
          <Tree
            style={{
              width: '100%',
              height: '100%'
            }}
            key={mustRender}
            dark={Window.config.dark}
            defaultExpandedKeys={JSON.parse(JSON.stringify(expandFolder))}
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
    </Loading>
  }
}
export { Explorer }