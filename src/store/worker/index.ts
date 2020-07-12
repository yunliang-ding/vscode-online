import { monacoService } from '../monaco/index'
import { fileSystem } from '../filesystem/index'
import { loader } from '../loader/index'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { fromCode, getCookie } from '../../axios/util'
class WorkerStore {
  worker: Worker
  loadModelNumber:number
  init = async () => {
    return fileSystem.modelNumber > 0 ? new Promise(resolve => {
      this.loadModelNumber = 0
      this.worker = this.createWorker(() => {
        const axios = new XMLHttpRequest();
        const createModel = (data) => {
          data.map(file => {
            if (file.type === 'file') {
              if (['.ts', '.tsx'].indexOf(file.extension) > -1) {
                axios.open("GET", `${location.origin}/workbench/file/getfile?path=${file.path}&token=${getCookie('token')}`, false);
                axios.send();
                const { data, isError } = JSON.parse(axios.responseText)
                if (!isError) {
                  self.postMessage(JSON.stringify({ content: data, path: file.path }), null)
                }
              }
            } else {
              createModel(file.children)
            }
          })
        }
        onmessage = (event) => {
          createModel(JSON.parse(event.data))
        }
      })
      this.worker.onmessage = (event: any) => {
        this.loadModelNumber ++
        if(this.loadModelNumber === fileSystem.modelNumber){
          resolve(true) // 告诉外面结束了，不用等待了
        }
        const { content, path } = JSON.parse(event.data)
        if(this.loadModelNumber === 1){
          loader.addStepInfos({isError: false, message: `加载:${path}`})
        } else {
          loader.setLastStepInfos({
            isError: false,
            message: `加载:${path}`
          })
        }
        monaco.editor.createModel(fromCode(content), 'typescript', monacoService.getUri(path))
      }
      this.worker.postMessage(JSON.stringify(fileSystem.files.children))
    }) : null
  }
  createWorker = (f) => {
    var blob = new Blob(['(' + f.toString() + ')()']);
    var url = window.URL.createObjectURL(blob);
    var worker = new Worker(url);
    return worker;
  }
}
const workerStore = new WorkerStore()
export {
  workerStore
}