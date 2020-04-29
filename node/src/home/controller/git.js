'use strict';
import Base from './base.js';
const { exec } = require('child_process')
const statusMapping = new Proxy({
  'A ': {
    inWorkingTree: 0,
    status: ["INDEX_NEW"]
  },
  '??': {
    inWorkingTree: 1,
    status: ["WT_NEW"]
  },
  'M ': {
    inWorkingTree: 0,
    status: ["INDEX_MODIFIED"]
  },
  ' M': {
    inWorkingTree: 1,
    status: ["WT_MODIFIED"]
  },
  'D ': {
    inWorkingTree: 0,
    status: ["INDEX_DELETED"]
  },
  ' D': {
    inWorkingTree: 1,
    status: ["WT_DELETED"]
  }
}, {
  get: (target, key, receiver) => {
    return target[key] || {
      inWorkingTree: 0,
      status: 0
    }
  }
})
export default class extends Base {
  async statusAction() {
    try {
      let data = await this.gitCommand(`cd ${this.get('path')};git status -s`)
      let status = []
      data.data.map(item => {
        status.push({
          path: item.substr(2),
          inWorkingTree: statusMapping[item.substring(0, 2)].inWorkingTree,
          status: statusMapping[item.substring(0, 2)].status
        })
      })
      console.log('data.data', data.data)
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
      // const branch = await Git.Repository.open(this.get('path')).then((_repository) => {
      //   return _repository.getCurrentBranch().then(res=>{
      //     return Git.Branch.name(res).then((_branch) => {
      //       return _branch
      //     })
      //   })
      // })
      this.json({
        data: {},
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
      const { data, isError } = await this.gitCommand(`cd ${this.get('path')};git add ${this.get('filePath')} -all`)
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
