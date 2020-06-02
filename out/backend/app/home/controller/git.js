'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('child_process'),
    exec = _require.exec;

var Git = require("nodegit");
var statusMapping = new Proxy({
  'A ': {
    inWorkingTree: 0,
    status: ["INDEX_NEW"]
  },
  '??': {
    inWorkingTree: 1,
    status: ["WT_NEW"]
  },
  'M ': {
    inWorkingTree: 0,
    status: ["INDEX_MODIFIED"]
  },
  ' M': {
    inWorkingTree: 1,
    status: ["WT_MODIFIED"]
  },
  'D ': {
    inWorkingTree: 0,
    status: ["INDEX_DELETED"]
  },
  ' D': {
    inWorkingTree: 1,
    status: ["WT_DELETED"]
  }
}, {
  get: function get(target, key, receiver) {
    return target[key] || {
      inWorkingTree: 0,
      status: 0
    };
  }
});

var _class = function (_Base) {
  (0, _inherits3.default)(_class, _Base);

  function _class() {
    (0, _classCallCheck3.default)(this, _class);
    return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
  }

  _class.prototype.statusAction = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var status;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return Git.Repository.open(this.get('path')).then(function (_repository) {
                return _repository.getStatus().then(function (_status) {
                  return _status.map(function (_item) {
                    return {
                      path: _item.path(),
                      isTypechange: _item.isTypechange(),
                      statusBit: _item.statusBit(),
                      status: _item.status(),
                      isNew: _item.isNew(),
                      isModified: _item.isModified(),
                      isDeleted: _item.isDeleted(),
                      inWorkingTree: _item.inWorkingTree(),
                      isConflicted: _item.isConflicted(),
                      isIgnored: _item.isIgnored(),
                      isRenamed: _item.isRenamed(),
                      inIndex: _item.inIndex(),
                      indexToWorkdir: _item.indexToWorkdir(),
                      headToIndex: _item.headToIndex()
                    };
                  });
                });
              });

            case 3:
              status = _context.sent;

              // let data = await this.gitCommand(`cd ${this.get('path')};git status -s`)
              // let status = []
              // data.data.map(item => {
              //   status.push({
              //     path: item.substr(2),
              //     inWorkingTree: statusMapping[item.substring(0, 2)].inWorkingTree,
              //     status: statusMapping[item.substring(0, 2)].status
              //   })
              // })
              this.json({
                data: status,
                isError: false
              });
              _context.next = 11;
              break;

            case 7:
              _context.prev = 7;
              _context.t0 = _context['catch'](0);

              console.log(_context.t0);
              this.json({
                error: _context.t0,
                isError: true
              });

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 7]]);
    }));

    function statusAction() {
      return _ref.apply(this, arguments);
    }

    return statusAction;
  }();

  _class.prototype.branchAction = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
      var branch;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return Git.Repository.open(this.get('path')).then(function (_repository) {
                return _repository.getCurrentBranch().then(function (res) {
                  return Git.Branch.name(res).then(function (_branch) {
                    return _branch;
                  });
                });
              });

            case 3:
              branch = _context2.sent;

              this.json({
                data: branch,
                isError: false
              });
              _context2.next = 11;
              break;

            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2['catch'](0);

              console.log(_context2.t0);
              this.json({
                error: _context2.t0,
                isError: true
              });

            case 11:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this, [[0, 7]]);
    }));

    function branchAction() {
      return _ref2.apply(this, arguments);
    }

    return branchAction;
  }();

  _class.prototype.getstagedAction = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
      var _this2 = this;

      var _ref4, data, stagedId, stagedContent;

      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';git ls-files -s');

            case 3:
              _ref4 = _context3.sent;
              data = _ref4.data;
              stagedId = '';

              data && data.some(function (_file) {
                if (_this2.get('name') === _file.split('\t')[1]) {
                  stagedId = _file.split('\t')[0].split(' ')[1];
                  return true; // 结束循环
                }
              });
              _context3.next = 9;
              return this.gitCommand('cd ' + this.get('path') + ';git cat-file -p ' + stagedId);

            case 9:
              stagedContent = _context3.sent;

              this.json({
                data: stagedContent && stagedContent.data && stagedContent.data.join('\n') || '',
                isError: false
              });
              _context3.next = 17;
              break;

            case 13:
              _context3.prev = 13;
              _context3.t0 = _context3['catch'](0);

              console.log(_context3.t0);
              this.json({
                error: _context3.t0,
                isError: true
              });

            case 17:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[0, 13]]);
    }));

    function getstagedAction() {
      return _ref3.apply(this, arguments);
    }

    return getstagedAction;
  }();

  _class.prototype.checkoutAction = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
      var _ref6, data, isError;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';git checkout -- ' + this.get('filePath'));

            case 3:
              _ref6 = _context4.sent;
              data = _ref6.data;
              isError = _ref6.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context4.next = 13;
              break;

            case 9:
              _context4.prev = 9;
              _context4.t0 = _context4['catch'](0);

              console.log(_context4.t0);
              this.json({
                error: _context4.t0,
                isError: true
              });

            case 13:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this, [[0, 9]]);
    }));

    function checkoutAction() {
      return _ref5.apply(this, arguments);
    }

    return checkoutAction;
  }();

  _class.prototype.addAction = function () {
    var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
      var _ref8, data, isError;

      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';git add ' + this.get('filePath'));

            case 3:
              _ref8 = _context5.sent;
              data = _ref8.data;
              isError = _ref8.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context5.next = 13;
              break;

            case 9:
              _context5.prev = 9;
              _context5.t0 = _context5['catch'](0);

              console.log(_context5.t0);
              this.json({
                error: _context5.t0,
                isError: true
              });

            case 13:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this, [[0, 9]]);
    }));

    function addAction() {
      return _ref7.apply(this, arguments);
    }

    return addAction;
  }();

  _class.prototype.resetAction = function () {
    var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
      var _ref10, data, isError;

      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              _context6.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';git reset HEAD -- ' + this.get('filePath'));

            case 3:
              _ref10 = _context6.sent;
              data = _ref10.data;
              isError = _ref10.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context6.next = 13;
              break;

            case 9:
              _context6.prev = 9;
              _context6.t0 = _context6['catch'](0);

              console.log(_context6.t0);
              this.json({
                error: _context6.t0,
                isError: true
              });

            case 13:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this, [[0, 9]]);
    }));

    function resetAction() {
      return _ref9.apply(this, arguments);
    }

    return resetAction;
  }();

  _class.prototype.gitignoreAction = function () {
    var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
      var _ref12, data, isError;

      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _context7.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';cat .gitignore;');

            case 3:
              _ref12 = _context7.sent;
              data = _ref12.data;
              isError = _ref12.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context7.next = 13;
              break;

            case 9:
              _context7.prev = 9;
              _context7.t0 = _context7['catch'](0);

              console.log(_context7.t0);
              this.json({
                error: _context7.t0,
                isError: true
              });

            case 13:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this, [[0, 9]]);
    }));

    function gitignoreAction() {
      return _ref11.apply(this, arguments);
    }

    return gitignoreAction;
  }();

  _class.prototype.waitcommitAction = function () {
    var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
      var _ref14, data, isError;

      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              _context8.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';git log origin/' + this.get('branch') + '..HEAD --oneline;');

            case 3:
              _ref14 = _context8.sent;
              data = _ref14.data;
              isError = _ref14.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context8.next = 13;
              break;

            case 9:
              _context8.prev = 9;
              _context8.t0 = _context8['catch'](0);

              console.log(_context8.t0);
              this.json({
                error: _context8.t0,
                isError: true
              });

            case 13:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this, [[0, 9]]);
    }));

    function waitcommitAction() {
      return _ref13.apply(this, arguments);
    }

    return waitcommitAction;
  }();

  _class.prototype.commitAction = function () {
    var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
      var _ref16, data, isError;

      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.prev = 0;
              _context9.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';git add .;git commit -m "' + this.get('commitInfo') + '";');

            case 3:
              _ref16 = _context9.sent;
              data = _ref16.data;
              isError = _ref16.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context9.next = 13;
              break;

            case 9:
              _context9.prev = 9;
              _context9.t0 = _context9['catch'](0);

              console.log(_context9.t0);
              this.json({
                error: _context9.t0,
                isError: true
              });

            case 13:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, this, [[0, 9]]);
    }));

    function commitAction() {
      return _ref15.apply(this, arguments);
    }

    return commitAction;
  }();

  _class.prototype.pushAction = function () {
    var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
      var _ref18, data, isError;

      return _regenerator2.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.prev = 0;
              _context10.next = 3;
              return this.gitCommand('cd ' + this.get('path') + ';git push;');

            case 3:
              _ref18 = _context10.sent;
              data = _ref18.data;
              isError = _ref18.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context10.next = 13;
              break;

            case 9:
              _context10.prev = 9;
              _context10.t0 = _context10['catch'](0);

              console.log(_context10.t0);
              this.json({
                error: _context10.t0,
                isError: true
              });

            case 13:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, this, [[0, 9]]);
    }));

    function pushAction() {
      return _ref17.apply(this, arguments);
    }

    return pushAction;
  }();

  _class.prototype.gitCommand = function () {
    var _ref19 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(cmd) {
      var data;
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.prev = 0;
              _context11.next = 3;
              return new _promise2.default(function (resolve) {
                exec(cmd, function (err, stdout, stderr) {
                  console.log('err==>', err);
                  if (err === null) {
                    if (stderr !== "") {
                      stdout = stderr + stdout;
                    }
                    resolve({
                      isError: false,
                      message: null,
                      data: stdout && stdout.split('\n').filter(function (_stdout) {
                        return _stdout !== '';
                      }),
                      stderr: stderr
                    });
                  } else {
                    resolve({
                      isError: true,
                      message: stderr
                    });
                  }
                });
              });

            case 3:
              data = _context11.sent;
              return _context11.abrupt('return', data);

            case 7:
              _context11.prev = 7;
              _context11.t0 = _context11['catch'](0);

              console.log(_context11.t0);
              return _context11.abrupt('return', {
                isError: true,
                error: _context11.t0
              });

            case 11:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, this, [[0, 7]]);
    }));

    function gitCommand(_x) {
      return _ref19.apply(this, arguments);
    }

    return gitCommand;
  }();

  return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=git.js.map