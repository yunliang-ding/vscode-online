import { monacoService } from '../monaco/index'
import { fileSystem } from '../filesystem/index'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { fromCode } from '../../axios/util'
class WorkerStore {
  worker: Worker
  loop = (data) => {
    data.map(file => {
      if (file.type === 'file') {
        ['.ts', '.tsx'].indexOf(file.extension) > -1 && this.worker.postMessage(file.path)
      } else {
        this.loop(file.children)
      }
    })
  }
  init = () => {
    this.worker = new Worker('./static/js/work.js');
    this.worker.onmessage = (event: any) => {
      const { content, path } = JSON.parse(event.data)
      monaco.editor.createModel(fromCode(content), 'typescript', monacoService.getUri(path))
    }
    this.loop(fileSystem.files.children)
  }
}
const workerStore = new WorkerStore()
export {
  workerStore
}