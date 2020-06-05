'use strict';
import Base from './base.js';
const dirTree = require("directory-tree");
const uuidv1 = require('uuid/v1');
const fse = require('fs-extra')
const fs = require('fs')
const { exec } = require('child_process')
const tokens = {}
let loginStatusCode = 0
export default class extends Base {
  /**
   * @return {Promise} []
   */
  __before() {
    // this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    // this.header('Access-Control-Allow-Headers', 'x-requested-with');
    // this.header('Access-Control-Request-Method', 'GET,POST,PUT,DELETE');
    // this.header('Access-Control-Allow-Credentials', 'true');
    let { token } = this.cookie()
    if (!token in tokens || think.isEmpty(token)) {
      loginStatusCode = -1
    } else {
      loginStatusCode = 0
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
  async loginAction() {
    const username = this.get('username')
    const password = this.get('passward')
    if (username === 'admin' && password === 'admin') {
      let token = uuidv1()
      tokens[token] = {
        username
      }
      this.cookie('token', token, {
        domain: '127.0.0.1',
        httponly: true // 只能通过http请求
      })
      this.json({
        isError: false
      })
    } else {
      this.json({
        isError: true
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
  async filelistAction() {
    let param = this.get('createModel') ? {
      extensions: /\.js|.jsx|.ts|.tsx/,
      exclude: /node_modules|.DS_Store|.git/
    } : {
      exclude: /node_modules|.DS_Store/
    }
    try {
      const data = dirTree(this.get('path'), param)
      if(this.get('createModel')){
        data.children = await this.queryContent(data.children)
      }
      this.json({
        data,
        loginStatusCode,
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
        loginStatusCode,
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
      if(exist){
        fse.outputFile(this.post('path'), this.toCode(this.post('content')).toString())
        this.json({
          isError: false,
          loginStatusCode,
        })
      } else {
        throw('file is not exist')
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
      if(!exist){
        const { data, isError } = await this.fileCommand(`cd ${this.post('path')};mv ${this.post('oldName')} ${this.post('newName')}`)
        this.json({
          data,
          isError
        })
      } else {
        throw(`${this.post('newName')} file already exists!`)
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
  async downloadAction(){
    let { path, type } = this.get()
    let name = path.split('/').slice(-1)[0]
    if(type === 'dir'){
      // 压缩文件夹
      await this.fileCommand(`cd ${path}; zip ${name}.zip ${path}`)
      path += '.zip' // 生成压缩文件
      this.download(path, name + '.zip')
      // 删除临时压缩文件
      // this.fileCommand(`cd ${path}; rm -rf ${name}.zip`)
    } else {
      this.download(path, name)
    }
  }
}
