/**
 * git ls-files
 * git cat-file -p 06c3ceb84763ec678602baa01ee3cba294d3f2a3; //查看当前暂存文件内容
 * git status -s; // 状态树
 * git reset HEAD <filePath> 取消暂存区域的改动 localRepository 覆盖 staged (拉取最近一次提交到版本库的文件到暂存区 该操作不影响工作区)
 * git add <filePath> 添加本地文件的改动到暂存区域 == workspace 覆盖 staged 
 * git checkout -- <filePath> 取消本地文件的改动 == staged 覆盖 workspace
 * git add .;git commit -m ""; // 提交  staded -> localRepository
 * git push; // 推送 localRepository -> remoteRepository (git仓库)
*/
import { observable, action, runInAction, toJS } from 'mobx'
import { get } from '../../axios/index'
import Mapping from '../mapping/index'
import { fileSystem } from '../filesystem/index'
const { IconMapping, IconColorMapping, StatusMapping, StatusColorMapping, LanguageMapping } = Mapping
class GitServices{
  @observable git = {
    isGitProject: true,
    branch: '',
    remoteUrl: '',
    userName: '',
    passward: '',
    waitCommitCount: 0,
    loadstate: false
  }
  @observable countChange: number = 0;
  @observable gitignores = []
  @observable workspaceChanges = []
  @observable stagedChanges = []
  @action queryStatus = async () => {
    if(this.git.isGitProject){
      const { data, isError } = await get('/api/git/status', {
        path: fileSystem.files.path
      })
      if (!isError) {
        runInAction(() => {
          this.git.isGitProject = true
          this.countChange = data && data.length || 0
          this.stagedChanges = []
          this.workspaceChanges = []
          data && data.forEach(_file => {
            let dir = _file.path.split('/')
            let name = dir.join('/')
            name = dir.pop()
            let extension = name.substr(name.lastIndexOf('.'))
            let prefix = _file.inWorkingTree === 0 ? ' (Staged)' : ' (WorkTree)'
            let path = fileSystem.files.path + '/' + _file.path
            const node = {
              id: path + prefix,
              diffEditor: true,
              isStaged: _file.inWorkingTree === 0,
              path,
              status: StatusMapping[_file.status[0]],
              color: StatusColorMapping[_file.status[0]],
              dir: dir.join('/'),
              name,
              prefix,
              extension,
              icon: IconMapping[extension],
              iconColor: IconColorMapping[extension],
              language: LanguageMapping[extension],
              level: []
            }
            if (node.isStaged) {
              this.stagedChanges.push(node)
            } else {
              this.workspaceChanges.push(node)
            }
          })
        })
      } else {
        console.log('query status error.')
      }
    }
  }
  @action queryBranch = async () => {
    if (this.git.isGitProject) {
      const { data, isError } = await get('/api/git/branch', {
        path: fileSystem.files.path
      })
      if (!isError) {
        runInAction(() => {
          this.git.branch = data
        })
      } else {
       console.log(`Query branch error.`)
      }
    }
  }
  @action gitignore = async () => {
    if (this.git.isGitProject) {
      const { data, isError } = await get('/api/git/gitignore', {
        path: fileSystem.files.path
      })
      !isError && runInAction(() => {
        this.gitignores = data
      })
    } else {
     console.log(`Is Not Git Project.`)
    }
  }
  @action queryStaged = async (path) => {
    return await get('/api/git/getstaged', {
      path: fileSystem.files.path,
      name: path
    })
  }
  @action queryStagedText = async (_node: any) => {
    const { data, isError } = await this.queryStaged(_node.path.replace(`${fileSystem.files.path}/`, ''))
    if (isError) {
      console.log(`query staged error.`)
    } else {
      runInAction(() => {
        _node.stagedContent = data
      })
    }
  }
  @action checkoutFile = async (filePath, sync) => {
    const { isError } = await get('/api/git/checkout', {
      path: fileSystem.files.path,
      filePath
    })
    if (isError) {
      console.log(`discard change ${filePath} error.`)
    } else {
      await this.queryStatus()
      await fileSystem.queryFiles()
    }
  }
  @action addFile = async (filePath) => {
    const { isError } = await get('/api/git/add', {
      path: fileSystem.files.path,
      filePath
    })
    if (isError) {
      console.log(`add ${filePath} file to staged error.`)
    } else {
      this.queryStatus()
    }
  }
  @action commitFile = async (commitInfo) => {
    const res = await get('/api/git/commit', {
      path: fileSystem.files.path,
      commitInfo
    })
    runInAction(async () => {
      await this.queryStatus()
      await fileSystem.refreshWt()
      await this.waitCommited()
    })
    if (res.isError) {
      console.log('commit error.')
    }
    return res
  }
  @action pushFile = async () => {
    const { isError } = await get('/api/git/push', {
      path: fileSystem.files.path
    })
    if (isError) {
      console.log('git push error.')
    } else {
      runInAction(() => {
        this.waitCommited()
      })
    }
  }
  @action resetFile = async (filePath) => {
    const { isError } = await get('/api/git/reset', {
      path: fileSystem.files.path,
      filePath
    })
    if (isError) {
      console.log(`reset ${filePath} file to workspace error.`)
    } else {
      this.queryStatus()
    }
  }
  @action waitCommited = async () => {
    if (this.git.isGitProject) {
      const { data, isError } = await get('/api/git/waitcommit', {
        path: fileSystem.files.path,
        branch: this.git.branch
      })
      !isError && (
        runInAction(() => {
          this.git.waitCommitCount = data.length
        })
      )
    }
  }
}
const git = new GitServices()
export {
  git
}