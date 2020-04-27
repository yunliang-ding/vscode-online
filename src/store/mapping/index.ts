const IconColorMapping = new Proxy({
  '.ts': '#1296db',
  '.js': '#ffeb3b',
  '.jsx': '#1296db',
  '.tsx': '#1296db',
  '.tsconfig': '#1296db',
  '.jsconfig': '#ffeb3b',
  '.css': '#1296db',
  '.less': '#1296db',
  '.html': '#e0620d',
  '.json': '#ffd607',
  '.sh': '#82529d',
  '.md': '#03a9f4',
  '.gitignore': '#607d8b',
  '.npmignore': '#f44336',
  'Makefile': '#1296db',
  '.babelrc': '#ffeb3b',
  '.zip': '#0e932e',
  '.tgz': '#0e932e',
  '.tar': '#0e932e',
  '.png': '#1296db',
  '.jpg': '#1296db',
  '.jpeg': '#1296db',
  '.gif': '#1296db',
  '.ico': '#1296db',
  '.py': '#1296db',
  '.bat': '#82529d',
  '.java': '#ff0000',
  '.cpp': '#1296db',
  '.vue': '#36ab60',
  'Dockerfile': '#1296db',
  '.yml':'#607d8b',
  '.conf': '#607d8b',
  '.sql':'#82529d',
  '.php':'#82529d',
  '.log':'#607d8b'
}, {
  get: (target, key: string, receiver) => {
    return target[key] || '#888'
  }
})
const IconMapping = new Proxy({
  '.ts': 'icon-file_type_typescript',
  '.js': 'icon-js',
  '.jsconfig': 'icon-js',
  '.jsx': 'icon-React',
  '.tsx': 'icon-React',
  '.tsconfig': 'icon-file_type_typescript',
  '.css': 'icon-css',
  '.less': 'icon-less',
  '.html': 'icon-html1',
  '.json': 'icon-json1',
  '.sh': 'icon-shell',
  '.md': 'icon-weibiaoti-',
  '.gitignore': 'icon-git',
  '.npmignore': 'icon-npm',
  '.babelrc': 'icon-babel',
  'Makefile': 'icon-file_type_makefile',
  '.zip': 'icon-zip',
  '.tgz': 'icon-zip',
  '.tar': 'icon-zip',
  '.png': 'icon-img',
  '.jpg': 'icon-img',
  '.jpeg': 'icon-img',
  '.gif': 'icon-img',
  '.ico': 'icon-img',
  '.py': 'icon-python',
  '.bat': 'icon-bat',
  '.java': 'icon-java',
  '.cpp': 'icon-cpp',
  '.vue': 'icon-vue',
  'Dockerfile': 'icon-Docker',
  '.yml':'icon-YML',
  '.conf': 'icon-config',
  '.sql':'icon-sql',
  '.php':'icon-php',
  '.log': 'icon-logs'
}, {
  get: (target, key: string, receiver) => {
    return target[key] || 'icon-geshihua'
  }
})
const LanguageMapping = new Proxy({
  '.js': 'javascript',
  '.ts': 'typescript',
  '.jsx': 'javascript',
  '.tsx': 'typescript',
  '.babelrc': 'json',
  '.css': 'css',
  '.less': 'less',
  '.sass': 'css',
  '.html': 'html',
  '.vue': 'html',
  '.json': 'json',
  '.sql': 'sql',
  '.sh': 'shell',
  'Makefile': 'markdown',
  '.dockerfile': 'dockerfile',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.bat': 'bat',
  '.log': 'markdown',
  '.md': 'markdown'
}, {
  get: (target, key: string, receiver) => {
    return target[key] || 'txt'
  }
})
const StatusMapping = new Proxy({
  'WT_NEW': 'U',
  'WT_MODIFIED': 'M',
  "WT_DELETED": 'D',
  "INDEX_NEW": 'U',
  "INDEX_MODIFIED": 'M',
  "INDEX_DELETED": 'D'
}, {
  get: (target, key: string, receiver) => {
    return target[key] || '?'
  }
})

const StatusColorMapping = new Proxy({
  'WT_NEW': '#73c991',
  'WT_MODIFIED': '#e2c08d',
  "WT_DELETED": '#f44336',
  "INDEX_NEW": '#73c991',
  "INDEX_MODIFIED": '#e2c08d',
  "INDEX_DELETED": '#f44336'
}, {
  get: (target, key: string, receiver) => {
    return target[key] || '#1e1e1e'
  }
})
export {
  IconMapping,
  IconColorMapping,
  LanguageMapping,
  StatusMapping,
  StatusColorMapping
}