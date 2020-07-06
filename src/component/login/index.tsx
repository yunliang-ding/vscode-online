import * as React from "react"
import { observer, inject } from 'mobx-react'
import { Input, Message, Button } from 'react-ryui'
import './index.less'
import { post } from "../../axios"
@inject('UI')
@observer
class Login extends React.Component<any, any> {
  props: any
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }
  render() {
    let theme = this.props.UI.isDark ? '-dark' : ''
    const message = new Message({
      duration: 3,
      dark: this.props.UI.isDark
    })
    return <div className={`app-login${theme}`}>
      <div className='app-login-left' />
      <div className='app-login-right'>
        <div className='app-login-box'>
          <div className='app-login-logo'>
            <i className='iconfont icon-tools'></i>
          </div>
          <div className='app-login-user'>
            <Input
              dark
              placeholder='请输入用户名'
              value={this.state.username}
              onChange={
                (e) => {
                  this.setState({ username: e.target.value })
                }
              }
            />
            <Input
              dark
              placeholder='请输入密码'
              type='password'
              value={this.state.password}
              onChange={
                (e) => {
                  this.setState({ password: e.target.value })
                }
              }
            />
          </div>
          <div className='app-login-footer'>
            <Button
              label='登录'
              dark
              type='primary'
              style={{
                width: 160,
                marginLeft: 8
              }}
              onClick={
                async () => {
                  const { data, isError } = await post('/workbench/file/login', this.state, {})
                  if (isError) {
                    message.warning('用户名或密码错误!')
                  } else {
                    this.props.UI.setLogin(true)
                  }
                }
              } />
          </div>
        </div>
      </div>
    </div>
  }
}
export { Login }