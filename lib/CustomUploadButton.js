'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var CustomUploadButton = function CustomUploadButton(props) {
  var style = props.style,
      className = props.className,
      children = props.children,
      _props$htmlFor = props.htmlFor,
      htmlFor = _props$htmlFor === undefined ? props.id : _props$htmlFor,
      inputProps = _objectWithoutProperties(props, ['style', 'className', 'children', 'htmlFor']);

  var buttonStyle = Object.assign({}, {
    pointer: 'cursor'
  }, style);

  return _react2.default.createElement(
    'label',
    { style: buttonStyle, className: className, htmlFor: htmlFor },
    children,
    _react2.default.createElement(_index2.default, _extends({ hidden: true }, inputProps))
  );
};

exports.default = CustomUploadButton;