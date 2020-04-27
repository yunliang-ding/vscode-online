import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Monaco } from '../monaco/index';
import './index.less'
const Window: any = window
@inject('UI')
@observer
class Code extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  render() {
    let theme = Window.config.dark ? '-dark' : ''
    return <div className={`app-code${theme}`}>
      <Monaco
        visabled
        path={`/app/klop`}
        theme={Window.config.dark ? 'vs-dark' : 'vs-light'}
        language='javascript'
        value={`import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Monaco } from '../monaco/index';
import './index.less'
const Window: any = window
@inject('UI')
@observer
class Code extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
  }
  render() {
    let theme = Window.config.dark ? '-dark' : ''
    return <div>
      <Monaco
        visabled
        path='/app/klop'
        theme={this.props.UI.monaco.theme}
        language='javascript'
      onChange={
        () => {
          this.onChange(_file)
        }
      }
      />
    </div>
  }
}
export { Code }`}
        onChange={
          (value) => {
            console.log(value)
          }
        }
      />
    </div>
  }
}
export { Code }