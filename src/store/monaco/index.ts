import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import { StandaloneCodeEditorServiceImpl } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneCodeServiceImpl.js'
import Mapping from '../mapping/index'
import { fileSystem } from '../filesystem/index'
import { observable, action, runInAction, toJS } from 'mobx'
import { textMateService } from './syntaxHighlighter'
import { get } from '../../axios/index'
const { LanguageMapping } = Mapping
const Window: any = window
// const { typescriptDefaults, javascriptDefaults }: any = monaco.languages.typescript
class MonacoService {
  diffEditor: monaco.editor.IStandaloneDiffEditor;
  options: monaco.editor.IEditorConstructionOptions = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    fontSize: 12,
    fontWeight: "400",
    minimap: {
      enabled: false
    }
  }
  compilerOptions = {
    target: 99,
    plugins: [
      {
        "name": "typescript-tslint-plugin"
      }
    ],
    jsx: 'react',
    module: 'commonjs',
    allowJs: true,  /* Allow javascript files to be compiled. */
    checkJs: false, /* Report errors in .js files. */
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    allowNonTsExtensions: true
  }
  @observable modelOptions = {}
  @action setModelOptions = (_key, _value) => {
    this.modelOptions[_key] = _value
    this.updateModelOptions({ [_key]: _value })
  }
  /**
   * 负责一个文件打开之后 所有 Monaco初始化的工作
   */
  init = (dom, options, onChange): monaco.editor.IStandaloneCodeEditor => {
    let oldDecorations = []
    let model = monaco.editor.getModel(this.getUri(options.path)) || monaco.editor.createModel(options.value, options.language, this.getUri(options.path))
    model.setValue(options.value)
    let editorMonaco: monaco.editor.IStandaloneCodeEditor = monaco.editor.create(dom, Object.assign({}, options, this.options, { model }), {
      textModelService: this.getTextModelService()
    })
    fileSystem.setFileNodeEditorMonacoByPath(editorMonaco, options.path)  // 挂在到 cacheFiles 中
    editorMonaco.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => { // ctrl + s
      fileSystem.saveCurrentFile()
    })
    this.updateModelOptions() // 更新 modelOptions
    editorMonaco.onDidChangeModelContent(() => { // onChange 事件
      onChange(editorMonaco.getValue())
      oldDecorations = this.textMateColor(editorMonaco, options.language, editorMonaco.getValue(), oldDecorations)
    })
    oldDecorations = this.textMateColor(editorMonaco, options.language, options.value, oldDecorations)
    return editorMonaco
  }
  dispose = (editorMonaco: monaco.editor.IStandaloneCodeEditor) => {
    editorMonaco && editorMonaco.dispose()
  }
  /**
   * textMateColor
   */
  textMateColor = (editorMonaco, language, value, oldDecorations) => {
    if (['javascript', 'typescript'].indexOf(language) > -1) {
      return editorMonaco.deltaDecorations(
        oldDecorations,
        textMateService(value)
      )
    }
    return []
  }
  /**
   * 
   */
  getTextModelService() {
    return {
      createModelReference(uri) {
        const model = {
          load() {
            return Promise.resolve(model)
          },
          dispose() {
          },
          textEditorModel: monaco.editor.getModel(uri)
        }
        return Promise.resolve({
          object: model,
          dispose() {
          }
        })
      }
    }
  }
  /**
   * 更新TextModelOptions
   */
  @action updateModelOptions(uptions?) {
    let editorMonaco = fileSystem.getFileNodeEditorMonaco()
    if (editorMonaco) {
      let model = editorMonaco.getModel()
      if (model) {
        runInAction(() => {
          this.modelOptions = Object.assign({}, model.getOptions(), uptions) // 加载这个model的属性
          model.updateOptions(this.modelOptions)
        })
      }
    }
  }
  /**
   * 创建diff
   */
  createDiffEditor = (dom, options) => {
    this.diffEditor = monaco.editor.createDiffEditor(dom, Object.assign({}, options, {
      selectOnLineNumbers: true,
      automaticLayout: true,
      fontSize: 12,
      fontWeight: "400",
    }))
    fileSystem.setFileNodeDiffEditorMonaco(this.diffEditor)  // 挂在到 cacheFiles 中
  }
  /**
   * 设置 options
  */
  setOptions = (options) => {
    options = options.replace(/\n/g, '')
    fileSystem.cacheFiles.map(_fileNode => {
      _fileNode.editorMonaco && _fileNode.editorMonaco.updateOptions(JSON.parse(options))
    })
    this.options = JSON.parse(options)
  }
  /**
  * 设置 compilerOptions
 */
  setCompilerOptions = (compilerOptions) => {
    compilerOptions = compilerOptions.replace(/\n/g, '')
    // typescriptDefaults._compilerOptions = JSON.parse(compilerOptions)
    this.compilerOptions = JSON.parse(compilerOptions)
  }
  /**
   * 重写 GoToDefinition
   */
  initGoToDefinitionCrossModels() {
    StandaloneCodeEditorServiceImpl.prototype.openCodeEditor = function (input, source, _sideBySide) {
      if (!source) {
        return Promise.resolve(null);
      }
      return Promise.resolve(this.doOpenEditor(source, input));
    }
    StandaloneCodeEditorServiceImpl.prototype.doOpenEditor = (editor, input) => {
      // 获取引用文件路径
      const path = input.resource.fsPath
      // 不在项目就调用外部路径生成 FileNode
      let fileNode = fileSystem.getFileNodeByPath(path, '', '')
      let selection = input.options.selection
      if (selection) {
        const editorMonaco = fileSystem.getFileNodeEditorMonacoByPath(path)
        if (editorMonaco) {
          if (typeof selection.endLineNumber === 'number' && typeof selection.endColumn === 'number') {
            editorMonaco.setSelection(selection)
            editorMonaco.revealRangeInCenter(selection, 1 /* Immediate */)
          } else {
            let pos = {
              lineNumber: selection.startLineNumber,
              column: selection.startColumn
            }
            editorMonaco.setPosition(pos)
            editorMonaco.revealPositionInCenter(pos, 1 /* Immediate */)
          }
          editorMonaco.focus()
        }
      }
      fileSystem.openFile(fileNode) // 打开这个文件
    }
  }
  /**
   * 编辑器初始化设置
  */
  initMonacoOptions = async () => {
    const options = await fileSystem.getFile(fileSystem.baseUrl + '/' + '.vscode/settings.json') // 查找ts相关配置文件
    const compilerOptions = await fileSystem.getFile(fileSystem.baseUrl + '/' + '.vscode/tsconfig.json') // 查找monaco相关配置文件
    if (!compilerOptions.isError) {
      compilerOptions.data = compilerOptions.data.replace(/\n/g, '')
      this.compilerOptions = JSON.parse(compilerOptions.data)
    }
    if (!options.isError) {
      options.data = options.data.replace(/\n/g, '')
      this.options = JSON.parse(options.data)
    }
    // typescriptDefaults._compilerOptions = this.compilerOptions
    // javascriptDefaults._compilerOptions = this.compilerOptions
  }
  createModelByContent = (content, language) => {
    return monaco.editor.createModel(content, language)
  }
  setModel = (originalModel, modifiedModel) => {
    this.diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    })
  }
  getUri = (filePath) => {
    return monaco.Uri.file(filePath)
  }
  createModel = (value: string, language?: string, uri?: monaco.Uri) => { // monaco 关联文件
    const flag = this.getModel(uri)
    if (!flag) {
      monaco.editor.createModel(value, language, uri)
    } else {
      // flag.setValue(value) // 重新更新文件
    }
  }
  getModel = (uri: monaco.Uri) => {
    return monaco.editor.getModel(uri)
  }
  getModels = () => {
    return monaco.editor.getModels()
  }
  startBindFile = async (extension?) => {
    const { isError, data } = await get('/api/file/filelist', {
      path: fileSystem.baseUrl,
      createModel: true
    })
    if (!isError && data) {
      await this.bindMonacoModel(data.children, extension)
    }
  }
  bindMonacoModel = async (data, extension) => {
    return new Promise((resolve)=>{
      setTimeout(async ()=>{
        for (let i = 0; i < data.length; i++) {
          let _data = data[i]
          if (_data.type === 'directory') {
            await this.bindMonacoModel(_data.children, extension)
          } else {
            if (extension && extension.includes(_data.extension)) {
              this.createModel(_data.content, LanguageMapping[_data.extension || _data.name], this.getUri(_data.path))
            } else {
              this.createModel(_data.content, LanguageMapping[_data.extension || _data.name], this.getUri(_data.path))
            }
          }
        }
        resolve()
      }, 10)
    }) 
  }
  goto = (range, model) => {
    let editorMonaco = fileSystem.getFileNodeEditorMonaco() // 获取当前文件的 monaco
    editorMonaco.setModel(model)
    editorMonaco.setSelection(range)
    editorMonaco.revealRangeInCenter(range)
  }
  format = () => {
    let editorMonaco = fileSystem.getFileNodeEditorMonaco() // 获取当前文件的 monaco
    editorMonaco.trigger('anyString', 'editor.action.formatDocument', {});
    editorMonaco.focus()
  }
  focus = () => {
    let editorMonaco = fileSystem.getFileNodeEditorMonaco() // 获取当前文件的 monaco
    editorMonaco && editorMonaco.focus() // focus
  }
  settingMonaco = async () => {
    this.initMonacoOptions() // 初始化 options
    this.initGoToDefinitionCrossModels()
  }
  addExtraLib = async () => {
    const { isError, data } = await fileSystem.getFile(`${fileSystem.baseUrl}/.vscode/extraLibs.json`)
    if (!isError) {
      let extraLibs = JSON.parse(data)
      for (let i = 0; i < extraLibs.length; i++) {
        const [[key, value]] = Window.Object.entries(extraLibs[i])
        const { isError, data } = await fileSystem.getFile(`${fileSystem.baseUrl}${value}`)
        if (!isError) {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(data, `file:///node_modules/@types/${key}/index.d.ts`)
          monaco.editor.createModel(data, 'typescript', this.getUri(`${fileSystem.baseUrl}${value}`))
        } else {
        }
      }
    } else {
    }
  }
}
const monacoService = new MonacoService()
export {
  monacoService
}