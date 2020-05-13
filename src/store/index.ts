import { ui as UI } from './ui/index'
import { monacoService as Monaco } from './monaco/index'
import { fileSystem as FileSystem } from './filesystem/index'
import { search as Search } from './search/index'
import { git as Git } from './git/index'
import { workerStore as WorkerStore } from './worker/index'
import { loader as Loader } from './loader/index'
export default {
  UI,
  Monaco,
  Git,
  FileSystem,
  Search,
  WorkerStore,
  Loader
}