import * as React from "react"
import * as ReactDOM from "react-dom"
import { App } from './app'
import { useStrict } from 'mobx'
import './index.less'
useStrict(true)
ReactDOM.render( <App />, document.querySelector('#app'))