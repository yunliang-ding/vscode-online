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
      search
    </div>
  }
}
export { Search }