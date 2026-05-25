"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _client = require("react-dom/client");
var _TextEditor = _interopRequireDefault(require("./TextEditor"));
require("./index.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Import createRoot from react-dom/client

const root = document.getElementById('root');

// Use createRoot from react-dom/client
const rootElement = (0, _client.createRoot)(root);
rootElement.render(/*#__PURE__*/_react.default.createElement(_react.default.StrictMode, null, /*#__PURE__*/_react.default.createElement(_TextEditor.default, null)));
var _default = exports.default = _TextEditor.default;