import * as React from 'react'
import { Router, Route, hashHistory } from 'react-router'
import { Layout } from './layout/index'
class AppRouter extends React.Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path={'*'} component={Layout} />
      </Router>
    )
  }
}
export { AppRouter }
