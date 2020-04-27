import * as React from "react"
import { Provider } from 'mobx-react'
import store from './store/index'
import { AppRouter } from './router'
import './app.less'
class App extends React.Component{
  constructor(props){
    super(props)
  }
  render () {
    return <Provider {...store}>
      <AppRouter />
    </Provider>
  }
}
export { App }