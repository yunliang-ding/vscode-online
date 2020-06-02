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

var dirTree = require("directory-tree");
var uuidv1 = require('uuid/v1');
var fse = require('fs-extra');
var fs = require('fs');

var _require = require('child_process'),
    exec = _require.exec;

var tokens = {};
var loginStatusCode = 0;

var _class = function (_Base) {
  (0, _inherits3.default)(_class, _Base);

  function _class() {
    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, _class);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, _Base.call.apply(_Base, [this].concat(args))), _this), _this.toCode = function (code) {
      //加密字符串
      var newCCode = '';
      for (var i = 0; i < code.length; i++) {
        newCCode += String.fromCharCode(code[i].charCodeAt() - 1);
      }
      return newCCode;
    }, _this.fromCode = function (code) {
      //解密字符串
      var newCCode = '';
      for (var i = 0; i < code.length; i++) {
        newCCode += String.fromCharCode(code[i].charCodeAt() + 1);
      }
      return newCCode;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  /**
   * @return {Promise} []
   */
  _class.prototype.__before = function __before() {
    // this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    // this.header('Access-Control-Allow-Headers', 'x-requested-with');
    // this.header('Access-Control-Request-Method', 'GET,POST,PUT,DELETE');
    // this.header('Access-Control-Allow-Credentials', 'true');
    var _cookie = this.cookie(),
        token = _cookie.token;

    if (!token in tokens || think.isEmpty(token)) {
      loginStatusCode = -1;
    } else {
      loginStatusCode = 0;
    }
  };

  _class.prototype.loginAction = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var username, password, token;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              username = this.get('username');
              password = this.get('passward');

              if (username === 'admin' && password === 'admin') {
                token = uuidv1();

                tokens[token] = {
                  username: username
                };
                this.cookie('token', token, {
                  domain: '127.0.0.1',
                  httponly: true // 只能通过http请求
                });
                this.json({
                  isError: false
                });
              } else {
                this.json({
                  isError: true
                });
              }

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function loginAction() {
      return _ref.apply(this, arguments);
    }

    return loginAction;
  }();

  _class.prototype.queryContent = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(data) {
      var res, i, _data;

      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              res = [];

              for (i = 0; i < data.length; i++) {
                _data = data[i];

                if (_data.type === 'directory') {
                  res.push(_data);
                  res.concat(this.queryContent(_data.children));
                } else {
                  _data.content = fse.readFileSync(_data.path, 'utf8');
                  res.push(_data);
                }
              }
              return _context2.abrupt('return', res);

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function queryContent(_x) {
      return _ref2.apply(this, arguments);
    }

    return queryContent;
  }();

  _class.prototype.filelistAction = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
      var param, data;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              param = this.get('createModel') ? {
                extensions: /\.js|.jsx|.ts|.tsx/,
                exclude: /node_modules|.DS_Store|.git/
              } : {
                exclude: /node_modules|.DS_Store/
              };
              _context3.prev = 1;
              data = dirTree(this.get('path'), param);

              if (!this.get('createModel')) {
                _context3.next = 7;
                break;
              }

              _context3.next = 6;
              return this.queryContent(data.children);

            case 6:
              data.children = _context3.sent;

            case 7:
              this.json({
                data: data,
                loginStatusCode: loginStatusCode,
                isError: false
              });
              _context3.next = 14;
              break;

            case 10:
              _context3.prev = 10;
              _context3.t0 = _context3['catch'](1);

              console.log(_context3.t0);
              this.json({
                error: _context3.t0,
                isError: false
              });

            case 14:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[1, 10]]);
    }));

    function filelistAction() {
      return _ref3.apply(this, arguments);
    }

    return filelistAction;
  }();

  _class.prototype.getfileAction = function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
      var data;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return fse.readFile(this.get('path'), 'utf8');

            case 3:
              data = _context4.sent;

              this.json({
                data: this.toCode(data),
                loginStatusCode: loginStatusCode,
                isError: false
              });
              _context4.next = 11;
              break;

            case 7:
              _context4.prev = 7;
              _context4.t0 = _context4['catch'](0);

              console.log(_context4.t0);
              this.json({
                error: _context4.t0,
                isError: true
              });

            case 11:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this, [[0, 7]]);
    }));

    function getfileAction() {
      return _ref4.apply(this, arguments);
    }

    return getfileAction;
  }();

  _class.prototype.savefileAction = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
      var exist;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return fs.existsSync(this.post('path'));

            case 3:
              exist = _context5.sent;

              if (!exist) {
                _context5.next = 9;
                break;
              }

              fse.outputFile(this.post('path'), this.toCode(this.post('content')).toString());
              this.json({
                isError: false,
                loginStatusCode: loginStatusCode
              });
              _context5.next = 10;
              break;

            case 9:
              throw 'file is not exist';

            case 10:
              _context5.next = 16;
              break;

            case 12:
              _context5.prev = 12;
              _context5.t0 = _context5['catch'](0);

              console.log(_context5.t0);
              this.json({
                error: _context5.t0,
                isError: true
              });

            case 16:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this, [[0, 12]]);
    }));

    function savefileAction() {
      return _ref5.apply(this, arguments);
    }

    return savefileAction;
  }();

  _class.prototype.newAction = function () {
    var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
      var _ref7, data, isError;

      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              _context6.next = 3;
              return this.fileCommand('cd ' + this.post('path') + ';touch ' + this.post('filename'));

            case 3:
              _ref7 = _context6.sent;
              data = _ref7.data;
              isError = _ref7.isError;

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

    function newAction() {
      return _ref6.apply(this, arguments);
    }

    return newAction;
  }();

  _class.prototype.deleteAction = function () {
    var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
      var _ref9, data, isError;

      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _context7.next = 3;
              return this.fileCommand('cd ' + this.post('path') + ';rm -rf ' + this.post('filename'));

            case 3:
              _ref9 = _context7.sent;
              data = _ref9.data;
              isError = _ref9.isError;

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

    function deleteAction() {
      return _ref8.apply(this, arguments);
    }

    return deleteAction;
  }();

  _class.prototype.newfolderAction = function () {
    var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
      var _ref11, data, isError;

      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              _context8.next = 3;
              return this.fileCommand('cd ' + this.post('path') + ';mkdir ' + this.post('foldername'));

            case 3:
              _ref11 = _context8.sent;
              data = _ref11.data;
              isError = _ref11.isError;

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

    function newfolderAction() {
      return _ref10.apply(this, arguments);
    }

    return newfolderAction;
  }();

  _class.prototype.renameAction = function () {
    var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
      var exist, _ref13, data, isError;

      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.prev = 0;
              _context9.next = 3;
              return fs.existsSync(this.post('path') + '/' + this.post('newName'));

            case 3:
              exist = _context9.sent;

              console.log(this.post('path') + '/' + this.post('newName'));

              if (exist) {
                _context9.next = 14;
                break;
              }

              _context9.next = 8;
              return this.fileCommand('cd ' + this.post('path') + ';mv ' + this.post('oldName') + ' ' + this.post('newName'));

            case 8:
              _ref13 = _context9.sent;
              data = _ref13.data;
              isError = _ref13.isError;

              this.json({
                data: data,
                isError: isError
              });
              _context9.next = 15;
              break;

            case 14:
              throw this.post('newName') + ' file already exists!';

            case 15:
              _context9.next = 21;
              break;

            case 17:
              _context9.prev = 17;
              _context9.t0 = _context9['catch'](0);

              console.log(_context9.t0);
              this.json({
                error: _context9.t0,
                isError: true
              });

            case 21:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, this, [[0, 17]]);
    }));

    function renameAction() {
      return _ref12.apply(this, arguments);
    }

    return renameAction;
  }();

  _class.prototype.fileCommand = function () {
    var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(cmd) {
      var data;
      return _regenerator2.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.prev = 0;
              _context10.next = 3;
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
              data = _context10.sent;
              return _context10.abrupt('return', data);

            case 7:
              _context10.prev = 7;
              _context10.t0 = _context10['catch'](0);

              console.log(_context10.t0);
              return _context10.abrupt('return', {
                isError: true,
                error: _context10.t0
              });

            case 11:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, this, [[0, 7]]);
    }));

    function fileCommand(_x2) {
      return _ref14.apply(this, arguments);
    }

    return fileCommand;
  }();

  return _class;
}(_base2.default);

exports.default = _class;
//# sourceMappingURL=file.js.map