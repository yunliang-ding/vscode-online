import { monacoService } from '../monaco/index'
import { fileSystem } from '../filesystem/index'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { fromCode } from '../../axios/util'
class WorkerStore {
  worker: Worker
  init = () => {
    this.worker = this.createWorker(() => {
      const axios = new XMLHttpRequest();
      const createModel = (data) => {
        data.map(file => {
          if (file.type === 'file') {
            if (['.ts', '.tsx'].indexOf(file.extension) > -1) {
              axios.open("GET", `${location.origin}/api/file/getfile?path=${file.path}`, false);
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
      const { content, path } = JSON.parse(event.data)
      monaco.editor.createModel(fromCode(content), 'typescript', monacoService.getUri(path))
    }
    this.worker.postMessage(JSON.stringify(fileSystem.files.children))
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