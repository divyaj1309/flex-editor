"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
require("./TextEditor.css");
var _fa = require("react-icons/fa");
var _cells = _interopRequireDefault(require("./cells.png"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// Import CSS file for styling

// Importing icons from react-icons
// Import your custom image

const TextEditor = () => {
  const [content, setContent] = (0, _react.useState)('');
  const [textColor, setTextColor] = (0, _react.useState)('#000000'); // Default color
  const [highlightColor, setHighlightColor] = (0, _react.useState)('#FFFF00'); // Default highlight color
  const editorRef = (0, _react.useRef)(null); // Reference to the editor area

  const [showTableModal, setShowTableModal] = (0, _react.useState)(false);
  const [hoveredRows, setHoveredRows] = (0, _react.useState)(0);
  const [hoveredCols, setHoveredCols] = (0, _react.useState)(0);
  const [isFullscreen, setIsFullscreen] = (0, _react.useState)(false); // State for fullscreen mode

  const getWordCount = () => {
    var _editorRef$current;
    return ((_editorRef$current = editorRef.current) === null || _editorRef$current === void 0 ? void 0 : _editorRef$current.innerText.trim().split(/\s+/).length) || 0;
  };
  const handleContentChange = () => {
    // Update content state with the current editor value
    setContent(editorRef.current.innerHTML);
  };
  const formatText = function (format) {
    let value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    document.execCommand(format, false, value);
  };
  const handleTextColorChange = color => {
    setTextColor(color); // Update the state with the new color
    formatText('foreColor', color); // Apply the color to selected text
  };
  const handleHighlightColorChange = color => {
    setHighlightColor(color); // Update the state with the new highlight color
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange();
      range.surroundContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };
  const handleInsertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      formatText('createLink', url);
    }
  };
  const handleAlignment = alignment => {
    formatText("justify".concat(alignment));
  };
  const handleClearFormatting = () => {
    formatText('removeFormat');
  };
  const handleIndent = () => {
    formatText('indent');
  };
  const handleOutdent = () => {
    formatText('outdent');
  };
  const handleFontStyleChange = e => {
    const selectedFont = e.target.value;
    if (selectedFont && editorRef.current) {
      // Apply the font to the selected text only
      document.execCommand("fontName", false, selectedFont);
    }
  };
  const handleFontSizeChange = e => {
    const selectedSize = e.target.value;
    if (selectedSize) {
      formatText("fontSize", selectedSize);
    }
  };
  const handleInsertBookmark = () => {
    const bookmarkName = prompt('Enter the bookmark name:');
    if (bookmarkName) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const anchor = document.createElement('a');
      anchor.name = bookmarkName;
      anchor.textContent = "\uD83D\uDD16".concat(bookmarkName);
      range.insertNode(anchor);

      // Move the caret after the bookmark
      range.setStartAfter(anchor);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };
  const handleInsertTable = () => {
    setShowTableModal(true);
  };
  const generateTableElement = (rows, cols) => {
    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.setAttribute('cellpadding', '5');
    table.setAttribute('cellspacing', '0');
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.marginBottom = '10px';
    table.style.borderCollapse = 'collapse';
    table.classList.add('custom-table'); // Add a class for custom styling

    for (let i = 0; i < rows; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < cols; j++) {
        const td = document.createElement('td');
        td.setAttribute('contenteditable', 'true');
        td.style.position = 'relative'; // Enable positioning for delete icons
        td.innerHTML = '&nbsp;'; // Add non-breaking space

        // Add delete row/column icons only to the first cell in each row/column
        if (i === 0) {
          const deleteColIcon = document.createElement('div');
          deleteColIcon.className = 'delete-icon delete-column';
          deleteColIcon.innerHTML = '&times;';
          deleteColIcon.title = 'Delete Column';
          deleteColIcon.addEventListener('click', () => deleteColumn(table, j));
          td.appendChild(deleteColIcon);
        }
        if (j === cols - 1) {
          const deleteRowIcon = document.createElement('div');
          deleteRowIcon.className = 'delete-icon delete-row';
          deleteRowIcon.innerHTML = '&times;';
          deleteRowIcon.title = 'Delete Row';
          deleteRowIcon.addEventListener('click', () => deleteRow(table, i));
          td.appendChild(deleteRowIcon);
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    return table;
  };

  // Function to delete a specific row
  const deleteRow = (table, rowIndex) => {
    table.deleteRow(rowIndex);
  };

  // Function to delete a specific column
  const deleteColumn = (table, colIndex) => {
    Array.from(table.rows).forEach(row => {
      if (row.cells[colIndex]) {
        row.deleteCell(colIndex);
      }
    });
  };
  const [darkMode, setDarkMode] = (0, _react.useState)(false);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const insertTableIntoEditor = (rows, cols) => {
    const table = generateTableElement(rows, cols);
    const editingArea = document.querySelector('.editing-area');
    if (editingArea) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      if (range && editingArea.contains(range.commonAncestorContainer)) {
        // Insert the table at the cursor's position
        const fragment = document.createDocumentFragment();
        fragment.appendChild(table);
        range.insertNode(fragment);

        // Move the cursor after the inserted table
        range.setStartAfter(table);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Append the table at the end of the content
        editingArea.appendChild(table);

        // Move the cursor after the appended table
        const newRange = document.createRange();
        newRange.setStartAfter(table);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      // Ensure focus remains in the editing area
      editingArea.focus();
    }
    setShowTableModal(false);
  };
  const toggleFullscreen = () => {
    const editorElement = document.querySelector('.text-editor');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      editorElement.classList.add('fullscreen'); // Add fullscreen class
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        editorElement.classList.remove('fullscreen'); // Remove fullscreen class
      }
    }
  };
  (0, _react.useEffect)(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "text-editor ".concat(darkMode ? "dark-mode" : "")
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => formatText('bold'),
    "aria-label": "Bold",
    title: "Bold"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaBold, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => formatText('italic'),
    "aria-label": "Italic",
    title: "Italic"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaItalic, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => formatText('underline'),
    "aria-label": "Underline",
    title: "Underline"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaUnderline, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: handleInsertTable,
    "aria-label": "Insert Table",
    title: "Add a Table"
  }, /*#__PURE__*/_react.default.createElement("img", {
    src: _cells.default,
    alt: "Insert Table",
    style: {
      width: 20,
      height: 20
    }
  }), " "), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => formatText('insertOrderedList'),
    "aria-label": "Numbered List",
    title: "Numbered List"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaListOl, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => formatText('insertUnorderedList'),
    "aria-label": "Bulleted List",
    title: "Bulleted List"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaListUl, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => handleAlignment('Left'),
    "aria-label": "Align Left",
    title: "Align Left"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaAlignLeft, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => handleAlignment('Center'),
    "aria-label": "Align Center",
    title: "Align Center"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaAlignCenter, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => handleAlignment('Right'),
    "aria-label": "Align Right",
    title: "Align Right"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaAlignRight, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => formatText('insertHorizontalRule'),
    "aria-label": "Horizontal Rule",
    title: "Horizontal Rule"
  }, "HR"), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => formatText('strikeThrough'),
    "aria-label": "Strikethrough",
    title: "Strikethrough"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaStrikethrough, null), " "), /*#__PURE__*/_react.default.createElement("button", {
    onClick: handleInsertLink,
    "aria-label": "Insert Link",
    title: "Insert Link"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaLink, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: handleClearFormatting,
    "aria-label": "Clear Formatting",
    title: "Clear Formatting"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaEraser, null)), /*#__PURE__*/_react.default.createElement("label", {
    "aria-label": "Text Color",
    title: "Text Color"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaHighlighter, null), /*#__PURE__*/_react.default.createElement("input", {
    type: "color",
    value: textColor,
    onChange: e => handleTextColorChange(e.target.value),
    title: "Text Color",
    "aria-label": "Choose Text Color"
  })), /*#__PURE__*/_react.default.createElement("label", {
    "aria-label": "Highlight Color",
    title: "Highlight Color"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaPalette, null), /*#__PURE__*/_react.default.createElement("input", {
    type: "color",
    value: highlightColor,
    onChange: e => handleHighlightColorChange(e.target.value),
    title: "Highlight Color",
    "aria-label": "Choose Highlight Color"
  })), /*#__PURE__*/_react.default.createElement("button", {
    onClick: handleIndent,
    "aria-label": "Indent",
    title: "Indent"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaIndent, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: handleOutdent,
    "aria-label": "Outdent",
    title: "Outdent"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaOutdent, null)), /*#__PURE__*/_react.default.createElement("select", {
    onChange: handleFontStyleChange,
    "aria-label": "Font Style"
  }, /*#__PURE__*/_react.default.createElement("option", {
    value: ""
  }, "Font Style"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Arial",
    style: {
      fontFamily: 'Arial'
    }
  }, "Arial"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Calibri",
    style: {
      fontFamily: 'Calibri'
    }
  }, "Calibri"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Cambria",
    style: {
      fontFamily: 'Cambria'
    }
  }, "Cambria"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Candara",
    style: {
      fontFamily: 'Candara'
    }
  }, "Candara"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Century Gothic",
    style: {
      fontFamily: 'Century Gothic'
    }
  }, "Century Gothic"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Comic Sans MS",
    style: {
      fontFamily: 'Comic Sans MS'
    }
  }, "Comic Sans MS"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Consolas",
    style: {
      fontFamily: 'Consolas'
    }
  }, "Consolas"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Courier New",
    style: {
      fontFamily: 'Courier New'
    }
  }, "Courier New"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Ebrima",
    style: {
      fontFamily: 'Ebrima'
    }
  }, "Ebrima"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Franklin Gothic Medium",
    style: {
      fontFamily: 'Franklin Gothic Medium'
    }
  }, "Franklin Gothic Medium"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Georgia",
    style: {
      fontFamily: 'Georgia'
    }
  }, "Georgia"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Impact",
    style: {
      fontFamily: 'Impact'
    }
  }, "Impact"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Lucida Console",
    style: {
      fontFamily: 'Lucida Console'
    }
  }, "Lucida Console"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Microsoft Sans Serif",
    style: {
      fontFamily: 'Microsoft Sans Serif'
    }
  }, "Microsoft Sans Serif"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Segoe UI",
    style: {
      fontFamily: 'Segoe UI'
    }
  }, "Segoe UI"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Sitka Text",
    style: {
      fontFamily: 'Sitka Text'
    }
  }, "Sitka Text"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Tahoma",
    style: {
      fontFamily: 'Tahoma'
    }
  }, "Tahoma"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Times New Roman",
    style: {
      fontFamily: 'Times New Roman'
    }
  }, "Times New Roman"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Trebuchet MS",
    style: {
      fontFamily: 'Trebuchet MS'
    }
  }, "Trebuchet MS"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Verdana",
    style: {
      fontFamily: 'Verdana'
    }
  }, "Verdana"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Webdings",
    style: {
      fontFamily: 'Webdings'
    }
  }, "Webdings"), /*#__PURE__*/_react.default.createElement("option", {
    value: "Wingdings",
    style: {
      fontFamily: 'Wingdings'
    }
  }, "Wingdings")), /*#__PURE__*/_react.default.createElement("div", {
    style: {
      display: "inline-block",
      backgroundColor: "#f4f4f4",
      padding: "8px 12px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "bold",
      border: "1px solid #ccc",
      boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
      position: "absolute",
      bottom: "10px",
      right: "10px"
    }
  }, "\uD83D\uDCDD Word Count: ", getWordCount()), /*#__PURE__*/_react.default.createElement("select", {
    onChange: e => handleFontSizeChange(e),
    "aria-label": "Font Size"
  }, /*#__PURE__*/_react.default.createElement("option", {
    value: "",
    disabled: true,
    selected: true
  }, "Font Size"), /*#__PURE__*/_react.default.createElement("option", {
    value: "1",
    style: {
      fontSize: '10px'
    }
  }, "10px"), /*#__PURE__*/_react.default.createElement("option", {
    value: "2",
    style: {
      fontSize: '12px'
    }
  }, "12px"), /*#__PURE__*/_react.default.createElement("option", {
    value: "3",
    style: {
      fontSize: '16px'
    }
  }, "16px"), /*#__PURE__*/_react.default.createElement("option", {
    value: "4",
    style: {
      fontSize: '18px'
    }
  }, "18px"), /*#__PURE__*/_react.default.createElement("option", {
    value: "5",
    style: {
      fontSize: '24px'
    }
  }, "24px"), /*#__PURE__*/_react.default.createElement("option", {
    value: "6",
    style: {
      fontSize: '32px'
    }
  }, "32px"), /*#__PURE__*/_react.default.createElement("option", {
    value: "7",
    style: {
      fontSize: '48px'
    }
  }, "48px")), /*#__PURE__*/_react.default.createElement("button", {
    onClick: handleInsertBookmark,
    "aria-label": "Insert Bookmark",
    title: "Insert Bookmark"
  }, /*#__PURE__*/_react.default.createElement(_fa.FaBookmark, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: toggleFullscreen,
    title: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'
  }, isFullscreen ? /*#__PURE__*/_react.default.createElement(_fa.FaCompress, null) : /*#__PURE__*/_react.default.createElement(_fa.FaExpand, null)), /*#__PURE__*/_react.default.createElement("button", {
    onClick: toggleDarkMode,
    title: "Toggle Dark Mode"
  }, "\uD83C\uDF19")), showTableModal && /*#__PURE__*/_react.default.createElement("div", {
    className: "table-modal"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "table-modal-content"
  }, /*#__PURE__*/_react.default.createElement("h2", null, "Select Table Size"), /*#__PURE__*/_react.default.createElement("div", {
    className: "table-grid"
  }, [...Array(10)].map((_, rowIndex) => /*#__PURE__*/_react.default.createElement("div", {
    key: rowIndex,
    className: "table-grid-row"
  }, [...Array(10)].map((_, colIndex) => /*#__PURE__*/_react.default.createElement("div", {
    key: colIndex,
    className: "table-cell ".concat(rowIndex < hoveredRows && colIndex < hoveredCols ? 'highlighted' : ''),
    onMouseEnter: () => {
      setHoveredRows(rowIndex + 1);
      setHoveredCols(colIndex + 1);
    }
    // onClick={() => insertTableIntoEditor(rowIndex + 1, colIndex + 1)}
    ,
    onClick: () => insertTableIntoEditor(colIndex + 1, rowIndex + 1) // Swap row and column values
  }))))), /*#__PURE__*/_react.default.createElement("p", null, hoveredRows, " x ", hoveredCols), /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => setShowTableModal(false)
  }, "Cancel"))), /*#__PURE__*/_react.default.createElement("div", {
    className: "editing-area",
    contentEditable: "true",
    spellCheck: "true" // Add this line to enable spell check
    ,
    ref: editorRef // Reference the editor area
    ,
    onInput: handleContentChange // Track content change
    ,
    "aria-label": "Text Editor",
    placeholder: "Start typing...",
    style: {
      fontFamily: 'Arial'
    } // Default font style
  }));
};
var _default = exports.default = TextEditor;