'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _image = require('./utils/image');

var _image2 = _interopRequireDefault(_image);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * FirebaseFileUploader for React
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var generateRandomFilename = function generateRandomFilename() {
  return (0, _uuid.v4)();
};

function extractExtension(filename) {
  return (/(?:\.([^.]+))?$/.exec(filename)[0]
  );
}

var FirebaseFileUploader = function (_Component) {
  _inherits(FirebaseFileUploader, _Component);

  function FirebaseFileUploader() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, FirebaseFileUploader);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FirebaseFileUploader.__proto__ || Object.getPrototypeOf(FirebaseFileUploader)).call.apply(_ref, [this].concat(args))), _this), _this.progressHandler = function (snapshot) {
      var progress = Math.round(100 * snapshot.bytesTransferred / snapshot.totalBytes);
      if (_this.props.onProgress) {
        _this.props.onProgress(progress);
      }
    }, _this.successHandler = function () {
      if (!_this.uploadTask) {
        return;
      }
      var filename = _this.uploadTask.snapshot.metadata.name;
      if (_this.props.onUploadSuccess) {
        _this.props.onUploadSuccess(filename);
      }
    }, _this.errorHandler = function (error) {
      if (_this.props.onUploadError) {
        _this.props.onUploadError(error);
      }
    }, _this.handleFileSelection = function (event) {
      var file = event.target.files[0];
      if (file) {
        _this.startUpload(file);
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(FirebaseFileUploader, [{
    key: 'componentWillUnmount',


    // Cancel upload if quiting
    value: function componentWillUnmount() {
      this.cancelRunningUpload();
    }
  }, {
    key: 'cancelRunningUpload',
    value: function cancelRunningUpload() {
      if (this.uploadTask) {
        if (this.uploadTask.snapshot.state === 'running') {
          this.uploadTask.cancel();
          this.uploadTask = null;
        }
      }
    }
  }, {
    key: 'startUpload',
    value: function startUpload(file) {
      var _this2 = this;

      // Cancel any running tasks
      this.cancelRunningUpload();

      var _props = this.props,
          onUploadStart = _props.onUploadStart,
          storageRef = _props.storageRef,
          metadata = _props.metadata,
          randomizeFilename = _props.randomizeFilename,
          filename = _props.filename;


      if (onUploadStart) {
        onUploadStart(file);
      }

      var generateFilename = randomizeFilename ? generateRandomFilename : typeof filename === 'function' && filename;

      var filenameToUse = generateFilename ? generateFilename() : filename || file.name;

      // Ensure there is an extension in the filename
      if (!extractExtension(filenameToUse)) {
        filenameToUse += extractExtension(file.name);
      }

      Promise.resolve().then(function () {
        var shouldResize = file.type.match(/image.*/) && (_this2.props.maxWidth || _this2.props.maxHeight);
        if (shouldResize) {
          return (0, _image2.default)(file, _this2.props.maxWidth, _this2.props.maxHeight);
        }
        return file;
      }).then(function (file) {
        _this2.uploadTask = storageRef.child(filenameToUse).put(file, metadata);
        _this2.uploadTask.on('state_changed', _this2.progressHandler, _this2.errorHandler, _this2.successHandler);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          storageRef = _props2.storageRef,
          onUploadStart = _props2.onUploadStart,
          onProgress = _props2.onProgress,
          onUploadSuccess = _props2.onUploadSuccess,
          onUploadError = _props2.onUploadError,
          randomizeFilename = _props2.randomizeFilename,
          metadata = _props2.metadata,
          filename = _props2.filename,
          maxWidth = _props2.maxWidth,
          maxHeight = _props2.maxHeight,
          hidden = _props2.hidden,
          _props2$as = _props2.as,
          Input = _props2$as === undefined ? 'input' : _props2$as,
          props = _objectWithoutProperties(_props2, ['storageRef', 'onUploadStart', 'onProgress', 'onUploadSuccess', 'onUploadError', 'randomizeFilename', 'metadata', 'filename', 'maxWidth', 'maxHeight', 'hidden', 'as']);

      var inputStyle = hidden ? Object.assign({}, props.style, {
        width: '0.1px',
        height: '0.1px',
        opacity: 0,
        overflow: 'hidden',
        position: 'absolute',
        zIndex: -1
      }) : props.style;

      return _react2.default.createElement(Input, _extends({
        type: 'file',
        onChange: this.handleFileSelection
      }, props, {
        style: inputStyle
      }));
    }
  }]);

  return FirebaseFileUploader;
}(_react.Component);

exports.default = FirebaseFileUploader;