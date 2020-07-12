'use strict';
import Base from './base.js'
import { User } from './user'
const { exec } = require('child_process')
const Git = require("nodegit")
// const statusMapping = new Proxy({
//   'A ': {
//     inWorkingTree: 0,
//     status: ["INDEX_NEW"]
//   },
//   '??': {
//     inWorkingTree: 1,
//     status: ["WT_NEW"]
//   },
//   'M ': {
//     inWorkingTree: 0,
//     status: ["INDEX_MODIFIED"]
//   },
//   ' M': {
//     inWorkingTree: 1,
//     status: ["WT_MODIFIED"]
//   },
//   'D ': {
//     inWorkingTree: 0,
//     status: ["INDEX_DELETED"]
//   },
//   ' D': {
//     inWorkingTree: 1,
//     status: ["WT_DELETED"]
//   }
// }, {
//   get: (target, key, receiver) => {
//     return target[key] || {
//       inWorkingTree: 0,
//       status: 0
//     }
//   }
// })
export default class extends Base {
  __before() {
    // this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    // this.header('Access-Control-Allow-Headers', 'x-requested-with');
    // this.header('Access-Control-Request-Method', 'GET,POST,PUT,DELETE');
    // this.header('Access-Control-Allow-Credentials', 'true');
    let token = this.header('Csrf-Token')
    if (User.token !== token && this.http.url !== '/file/login') {
      this.json({
        code: 403,
        isError: true,
        message: User.token === this.cookie('token') ? '不支持外部请求' : '需要登录',
        data: []
      })
    }
  }
  async statusAction() {
    try {
      const status = await Git.Repository.open(this.get('path')).then((_repository) => {
        return _repository.getStatus().then(_status => {
          return _status.map(_item => {
            return {
              path: _item.path(),
              isTypechange: _item.isTypechange(),
              statusBit: _item.statusBit(),
              status: _item.status(),
              isNew: _item.isNew(),
              isModified: _item.isModified(),
              isDeleted: _item.isDeleted(),
              inWorkingTree: _item.inWorkingTree(),
              isConflicted: _item.isConflicted(),
              isIgnored: _item.isIgnored(),
              isRenamed: _item.isRenamed(),
              inIndex:_item.inIndex(),
              indexToWorkdir: _item.indexToWorkdir(),
              headToIndex: _item.headToIndex()
            }
          })
        })
      })
      // let data = await this.gitCommand(`cd ${this.get('path')};git status -s`)
      // let status = []
      // data.data.map(item => {
      //   status.push({
      //     path: item.substr(2),
      //     inWorkingTree: statusMapping[item.substring(0, 2)].inWorkingTree,
      //     status: statusMapping[item.substring(0, 2)].status
      //   })
      // })
      this.json({
        data: status,
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
  async branchAction() {
    try {
      const branch = await Git.Repository.open(this.get('path')).then((_repository) => {
        return _repository.getCurrentBranch().then(res=>{
          return Git.Branch.name(res).then((_branch) => {
            return _branch
          })
        })
      })
      this.json({
        data: branch,
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
  async getstagedAction() {
    try {
      const { data } = await this.gitCommand(`cd ${this.get('path')};git ls-files -s`);
      let stagedId = ''
      data && data.some(_file => {
        if (this.get('name') === _file.split('\t')[1]) {
          stagedId = _file.split('\t')[0].split(' ')[1]
          return true // 结束循环
        }
      })
      const stagedContent = await this.gitCommand(`cd ${this.get('path')};git cat-file -p ${stagedId}`)
      this.json({
        data: stagedContent && stagedContent.data && stagedContent.data.join('\n') || '',
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
  async checkoutAction() {
    try {
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};git checkout -- ${this.get('filePath')}`)
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
  async addAction() {
    try {
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};git add ${this.get('filePath')}`)
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
  async resetAction() {
    try {
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};git reset HEAD -- ${this.get('filePath')}`)
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
  async gitignoreAction() {
    try {
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};cat .gitignore;`)
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
  async waitcommitAction() {
    try {
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};git log origin/${this.get('branch')}..HEAD --oneline;`)
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
  async commitAction() {
    try {
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};git add .;git commit -m "${this.get('commitInfo')}";`)
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
  async pushAction() {
    try {
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};git push;`)
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
  async gitCommand(cmd) {
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
}
