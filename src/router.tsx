import * as React from 'react'
import { Router, Route, browserHistory } from 'react-router'
import { Layout } from './layout/index'
class AppRouter extends React.Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path={'/'} component={Layout} />
      </Router>
    )
  }
}
export { AppRouter }
