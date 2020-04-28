import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Explorer } from './explorer/index'
import { Search } from './search/index'
import { Git } from './git/index'
import './index.less'
const Window: any = window
@inject('UI')
@observer
class SiderBar extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  render() {
    let theme = Window.config.dark ? '-dark' : ''
    const { currentTab } = this.props.UI
    return <div className={`app-sider-bar${theme}`}>
      {
        currentTab === 'Explorer' ? <Explorer /> :  currentTab === 'Git' ? <Git /> : <Search />
      }
    </div>
  }
}
export { SiderBar }