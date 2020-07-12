'use strict';
import Base from './base.js'
import { User } from './user'
const config = require('../../../www/config.json')
const dirTree = require("directory-tree")
const uuidv1 = require('uuid/v1')
const fse = require('fs-extra')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
export default class extends Base {
  /**
   * @return {Promise} []
   */
  __before() {
    // this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    // this.header('Access-Control-Allow-Headers', 'x-requested-with');
    // this.header('Access-Control-Request-Method', 'GET,POST,PUT,DELETE');
    // this.header('Access-Control-Allow-Credentials', 'true');
    let token = this.header('Csrf-Token') || this.get('token')
    if (User.token !== token && this.http.url !== '/file/login') {
      this.json({
        code: 403,
        isError: true,
        message: User.token === this.cookie('token') ? '无效的token' : '需要登录',
        data: []
      })
    }
  }
  toCode = (code) => {  //加密字符串
    let newCCode = ''
    for (let i = 0; i < code.length; i++) {
      newCCode += String.fromCharCode(code[i].charCodeAt() - 1)
    }
    return newCCode
  }
  fromCode = (code) => { //解密字符串
    let newCCode = ''
    for (let i = 0; i < code.length; i++) {
      newCCode += String.fromCharCode(code[i].charCodeAt() + 1)
    }
    return newCCode
  }
  async isloginAction() {
    let { token } = this.cookie()
    this.json({
      code: User.token !== token ? 403 : 200
    })
  }
  async loginAction() {
    const { username, password } = this.post()
    if (username === config.username && password === config.password) {
      User.token = uuidv1() // 生成用户的token
      this.cookie('token', User.token, {
        // domain: this.header('origin'),
        // httponly: true // 只能通过http请求
      })
      this.json({
        isError: false,
        message: '登录成功'
      })
    } else {
      this.json({
        code: 403,
        isError: true,
        message: '需要登录'
      })
    }
  }
  async queryContent(data) {
    let res = []
    for (let i = 0; i < data.length; i++) {
      let _data = data[i]
      if (_data.type === 'directory') {
        res.push(_data)
        res.concat(this.queryContent(_data.children))
      } else {
        _data.content = fse.readFileSync(_data.path, 'utf8')
        res.push(_data)
      }
    }
    return res
  }
  async getdirsAction() {
    try {
      let queryDir = async (dir) => {
        return new Promise(resolve => {
          let data = []
          fs.readdir(dir, (err, files) => {
            files.forEach(file => {
              if (file.startsWith('.')) return
              let filepath = path.join(dir, file)
              let stats = fs.statSync(filepath)
              if (stats.isDirectory()) {
                data.push({
                  type: 'directory',
                  name: file,
                  path: filepath
                })
              }
            })
            resolve(data)
          })
        })
      }
      const data = await queryDir(this.get('dir'))
      this.json({
        data,
        isError: false
      })
    } catch (error) {
      this.json({
        error,
        isError: true
      })
    }
  }
  async filelistAction() {
    let param = this.get('createModel') ? {
      extensions: /\.js|.jsx|.ts|.tsx/,
      exclude: /node_modules|.DS_Store|.git/
    } : {
        exclude: /node_modules|.DS_Store/
      }
    try {
      const data = dirTree(this.get('path'), param)
      if (this.get('createModel')) {
        data.children = await this.queryContent(data.children)
      }
      this.json({
        data,
        isError: false
      })
    } catch (error) {
      console.log(error)
      this.json({
        error,
        isError: false
      })
    }
  }
  async getfileAction() {
    try {
      const data = await fse.readFile(this.get('path'), 'utf8')
      this.json({
        data: this.toCode(data),
        isError: false
      })
    } catch (error) {
      console.log(error)
      this.json({
        error,
        isError: true
      })
    }
  }
  async savefileAction() {
    try {
      const exist = await fs.existsSync(this.post('path'))
      if (exist) {
        fse.outputFile(this.post('path'), this.toCode(this.post('content')).toString())
        this.json({
          isError: false,
        })
      } else {
        throw ('file is not exist')
      }
    } catch (error) {
      console.log(error)
      this.json({
        error,
        isError: true
      })
    }
  }
  async newAction() {
    try {
      const { data, isError } = await this.fileCommand(`cd ${this.post('path')};touch ${this.post('filename')}`)
      this.json({
        data,
        isError
      })
    } catch (error) {
      console.log(error)
      this.json({
        error,
        isError: true
      })
    }
  }
  async deleteAction() {
    try {
      const { data, isError } = await this.fileCommand(`cd ${this.post('path')};rm -rf ${this.post('filename')}`)
      this.json({
        data,
        isError
      })
    } catch (error) {
      console.log(error)
      this.json({
        error,
        isError: true
      })
    }
  }
  async newfolderAction() {
    try {
      const { data, isError } = await this.fileCommand(`cd ${this.post('path')};mkdir ${this.post('foldername')}`)
      this.json({
        data,
        isError
      })
    } catch (error) {
      console.log(error)
      this.json({
        error,
        isError: true
      })
    }
  }
  async renameAction() {
    try {
      const exist = await fs.existsSync(this.post('path') + '/' + this.post('newName'))
      console.log(this.post('path') + '/' + this.post('newName'))
      if (!exist) {
        const { data, isError } = await this.fileCommand(`cd ${this.post('path')};mv ${this.post('oldName')} ${this.post('newName')}`)
        this.json({
          data,
          isError
        })
      } else {
        throw (`${this.post('newName')} file already exists!`)
      }
    } catch (error) {
      console.log(error)
      this.json({
        error,
        isError: true
      })
    }
  }
  async fileCommand(cmd) {
    try {
      const data = await new Promise((resolve) => {
        exec(cmd, (err, stdout, stderr) => {
          console.log('err==>', err)
          if (err === null) {
            if (stderr !== "") {
              stdout = stderr + stdout
            }
            resolve({
              isError: false,
              message: null,
              data: stdout && stdout.split('\n').filter(_stdout => {
                return _stdout !== ''
              }),
              stderr
            })
          } else {
            resolve({
              isError: true,
              message: stderr
            })
          }
        })
      })
      return data
    } catch (error) {
      console.log(error)
      return {
        isError: true,
        error
      }
    }
  }
  async downloadAction() {
    let { path, type } = this.get()
    let name = path.split('/').slice(-1)[0]
    if (type === 'dir') {
      // 压缩文件夹
      await this.fileCommand(`cd ${path}; zip -r ${name}.zip ./*`)
      path += `/${name}.zip` // 生成压缩文件
      this.download(path, name + '.zip')
    } else {
      this.download(path, name)
    }
  }
}
