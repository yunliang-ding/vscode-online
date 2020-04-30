import * as React from "react"
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import './index.less'
import { Loading, Tree } from 'ryui'
const Window: any = window
@inject('UI', 'FileSystem', 'Search', 'Monaco')
@observer
class Search extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  openFile = async (node) => {
    await this.props.FileSystem.openFile(node)
    await this.props.Monaco.goto(node.range, node.model)
  }
  renderSearch = (data) => {
    return data.map(item => {
      let obj: any = {
        key: item.type === 'directory' ? item.path : item.path + '(file)',
        label: <div title={item.path} style={{ width: '100%', height: '100%', lineHeight: '24px' }} onClick={
          (e) => {
            item.type === 'file' && e.stopPropagation()
            item.type === 'file' && this.openFile(item)
          }
        }>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {
              item.type === 'file' && <i className={'iconfont ' + item.icon} style={{ color: item.iconColor, marginRight: 8 }}></i>
            }
            {
              item.type === 'directory' ? item.name : <div style={{
                overFlow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {
                  item.label.map(_item => {
                    return _item.key ? <span className='search-keyword-lighthigh' key={_item.uuid}>
                      {_item.text}
                    </span>
                      : _item.text
                  })
                }
              </div>
            }
          </div>
        </div>
      }
      if (item.children) {
        obj.children = this.renderSearch(item.children)
      }
      Object.assign(item, obj)
      return item
    })
  }
  render() {
    const { cacheFiles } = this.props.FileSystem
    const { searchCount, searchFiles, loading, search, searchContent, setSearchContent, clearResult, setExpandFolder, expandFolder } = this.props.Search
    let theme = Window.config.dark ? '-dark' : ''
    const data = this.renderSearch(toJS(searchFiles))
    let currentFile = cacheFiles.find(item => item.selected) || {}
    return <Loading
      style={{ height: '100%', width: '100%' }}
      loading={loading}
    >
      <div className={`app-search${theme}`}>
        <div className='app-search-header'>
          <div className='app-search-header-left'>
            search
          </div>
          <div className='app-search-header-right'>
            <i className='iconfont icon-shuaxin' onClick={
              () => {
                search(searchContent)
              }
            }></i>
            <i className='iconfont icon-shanchu' onClick={clearResult}></i>
          </div>
        </div>
        <div className='app-search-input'>
          <input
            autoFocus
            value={searchContent}
            autoComplete='off'
            placeholder='search (press Enter to search)'
            onChange={
              (e) => {
                setSearchContent(e.target.value)
              }
            }
            onKeyDown={
              (e: any) => {
                if (e.keyCode === 13) {
                  search(e.target.value)
                }
              }
            } />
        </div>
        <div className='app-search-result-info'>
          {searchCount} results in {searchFiles.length} files
        </div>
        <div className='app-search-box'>
          <Tree
            style={{
              width: '100%',
              height: '100%'
            }}
            dark={Window.config.dark}
            defaultCheckedKeys={[currentFile.path]}
            defaultExpandedKeys={JSON.parse(JSON.stringify(expandFolder))}
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
export { Search }