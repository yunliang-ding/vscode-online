import { observable, action, runInAction } from 'mobx'
import { get } from '../../axios/index'
const $: any = document.querySelector.bind(document)
const Window: any = window
class UI {
  @observable loading = false
  @observable login = null // 默认没有登录
  @observable isDark = localStorage.getItem("theme") !== 'light' // 默认黑色主题
  @observable currentTab = 'Explorer'
  @observable fullScreen = false
  @observable openProjectVisabled = false
  @observable projectPath = localStorage.getItem('project_path') || ''
  @observable projectList = localStorage.getItem('project_list') ? JSON.parse(localStorage.getItem('project_list')) : []
  @action setOpenProjectVisabled = (openProjectVisabled:boolean) => {
    this.openProjectVisabled = openProjectVisabled
  }
  @action setProjectPath = (projectPath:string) => {
    this.projectPath = projectPath
  }
  @action addProjectList = (projectPath:string) => {
    this.projectList.indexOf(projectPath) === -1 && this.projectList.push(projectPath)
  }
  @action isLogin = async () => {
    const { code } = await get('/workbench/file/islogin', {})
    runInAction(() => {
      this.login = code !== 403
    })
  }
  @observable tabList = [{
    icon: 'codicon-files',
    label: 'Explorer'
  }, {
    icon: 'codicon-search',
    label: 'Search'
  }, {
    icon: 'codicon-source-control',
    label: 'Git'
  }]
  @action setLoading = (loading: boolean): void => {
    this.loading = loading
  }
  @action setLogin = (login: boolean): void => {
    this.login = login
  }
  @action setCurrentTab = (currentTab: string): void => {
    this.currentTab = currentTab
  }
  @action setFullScreen = (fullScreen: boolean) => {
    this.fullScreen = fullScreen
  }
  @action setTheme = (isDark: boolean) => {
    this.isDark = isDark
    if (isDark) {
      Window.config.dark = true
      let href = $('#style-theme').getAttribute('href').replace('light', 'dark')
      $('#style-theme').setAttribute('href', href)
      localStorage.setItem("theme", 'dark')
    } else {
      Window.config.dark = false
      let href = $('#style-theme').getAttribute('href').replace('dark', 'light')
      $('#style-theme').setAttribute('href', href)
      localStorage.setItem("theme", 'light')
    }
  }
  @action openProject = (projectPath) => {
    this.addProjectList(projectPath)
    localStorage.setItem('project_path', projectPath)
    localStorage.setItem('project_list', JSON.stringify(this.projectList))
    location.reload();
  }
}
const ui = new UI()
export {
  ui
}