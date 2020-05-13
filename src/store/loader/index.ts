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
    this.addStepInfos({isError: false, message: '项目加载.'})
    await fileSystem.queryFiles() // 加载项目
    this.addStepInfos({isError: false, message: 'git信息获取.'})
    await git.queryBranch() // 加载分支
    await git.waitCommited() // 等待push
    this.addStepInfos({isError: false, message: '加载monaco配置.'})
    await monacoService.settingMonaco() // 配置monaco
    this.addStepInfos({isError: false, message: 'monaco配置完毕.'})
    this.addStepInfos({isError: false, message: '创建文件model关联，请耐心等待.'})
    await workerStore.init() // worker
    this.addStepInfos({isError: false, message: 'model关联创建完毕.'})
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