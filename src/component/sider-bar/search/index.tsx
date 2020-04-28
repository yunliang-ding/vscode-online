import * as React from "react"
import { observer, inject } from 'mobx-react'
import './index.less'
const Window: any = window
@inject('UI', 'FileSystem', 'Mapping', 'Git')
@observer
class Search extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  render() {
    let theme = Window.config.dark ? '-dark' : ''
    return <div className={`app-search${theme}`}>
      <div className='app-search-header'>
        <div className='app-search-header-left'>
          search
        </div>
        <div className='app-search-header-right'>
          <i className='iconfont icon-shuaxin'></i>
          <i className='iconfont icon-shanchu'></i>
        </div>
      </div>
      <div className='app-search-body'>
        <div className='app-search-input'>
          <input autoFocus autoComplete='off' id='commit-info' placeholder='search (press Enter to search)' onKeyDown={
            (e: any) => {
              if (e.keyCode === 13) {
              }
            }
          } />
        </div>
      </div>
    </div>
  }
}
export { Search }