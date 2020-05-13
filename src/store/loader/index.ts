import { observable, action, runInAction } from 'mobx'
import { fileSystem } from '../filesystem/index'
import { git } from '../git/index'
import { monacoService } from '../monaco/index'
import { workerStore } from '../worker/index'
class Loader {
  @observable loading = false // 是否加载中
  @observable stepInfos = [] // 步骤信息
  @action start = async (path) => {
    this.loading = true
    await fileSystem.setBaseUrl(path) // 设置项目path
    await fileSystem.queryFiles() // 加载项目
    await git.queryBranch() // 加载分支
    await git.waitCommited() // 等待push
    await monacoService.settingMonaco() // 配置monaco
    await workerStore.init() // worker
    setTimeout(() => { // 视觉层面延迟1秒进入
      runInAction(() => {
        this.loading = false
      })
    }, 1000)
  }
  @action addStepInfos = (stepInfo: any): void => {
    this.stepInfos.push(stepInfo)
  }
  @action clearStepInfos = (): void => {
    this.stepInfos = []
  }
}
const loader = new Loader()
export {
  loader
}