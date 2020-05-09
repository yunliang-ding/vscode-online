import { observable, action } from 'mobx'
const $: any = document.querySelector.bind(document)
const Window: any = window
class UI {
  @observable loading = false
  @observable login = false
  @observable isDark = true // 默认黑色主题
  @observable currentTab = 'Explorer'
  @observable fullScreen = false
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
    } else {
      Window.config.dark = false
      let href = $('#style-theme').getAttribute('href').replace('dark', 'light')
      $('#style-theme').setAttribute('href', href)
    }
  }
}
const ui = new UI()
export {
  ui
}