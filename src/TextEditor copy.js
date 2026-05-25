import React, { useState, useEffect, useRef } from 'react';
import './TextEditor.css'; // Import CSS file for styling
import {
  FaBold, FaBookmark, FaStrikethrough, FaItalic, FaUnderline, FaListOl, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaEraser, FaIndent, FaOutdent, FaPalette, FaHighlighter, FaExpand,
  FaCompress
} from 'react-icons/fa'; // Importing icons from react-icons
import tableIcon from './cells.png';  // Import your custom image

const TextEditor = () => {
  const [content, setContent] = useState('');
  const [textColor, setTextColor] = useState('#000000'); // Default color
  const [highlightColor, setHighlightColor] = useState('#FFFF00'); // Default highlight color
  const editorRef = useRef(null); // Reference to the editor area

  const [showTableModal, setShowTableModal] = useState(false);
  const [hoveredRows, setHoveredRows] = useState(0);
  const [hoveredCols, setHoveredCols] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false); // State for fullscreen mode


  const getWordCount = () => {
    return editorRef.current?.innerText.trim().split(/\s+/).length || 0;
  };
  


  const handleContentChange = () => {
    // Update content state with the current editor value
    setContent(editorRef.current.innerHTML);
  };

  const formatText = (format, value = null) => {
    document.execCommand(format, false, value);
  };


  const handleTextColorChange = (color) => {
    setTextColor(color); // Update the state with the new color
    formatText('foreColor', color); // Apply the color to selected text
  };

  const handleHighlightColorChange = (color) => {
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




  const handleAlignment = (alignment) => {
    formatText(`justify${alignment}`);
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



  const handleFontStyleChange = (e) => {
    const selectedFont = e.target.value;
    if (selectedFont && editorRef.current) {
      // Apply the font to the selected text only
      document.execCommand("fontName", false, selectedFont);
    }
  };

  const handleFontSizeChange = (e) => {
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
      anchor.textContent = `🔖${bookmarkName}`;
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
    Array.from(table.rows).forEach((row) => {
      if (row.cells[colIndex]) {
        row.deleteCell(colIndex);
      }
    });
  };
  const [darkMode, setDarkMode] = useState(false);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={`text-editor ${darkMode ? "dark-mode" : ""}`}>
      {/* Editor Name */}

      {/* Toolbar */}
      <div className="toolbar">


        <button onClick={() => formatText('bold')} aria-label="Bold" title="Bold"><FaBold /></button>
        <button onClick={() => formatText('italic')} aria-label="Italic" title="Italic"><FaItalic /></button>
        <button onClick={() => formatText('underline')} aria-label="Underline" title="Underline"><FaUnderline /></button>


        {/* <button onClick={handleInsertTable} aria-label="Insert Table" title="Insert Table"><FaTable /></button> */}
        <button onClick={handleInsertTable} aria-label="Insert Table" title="Add a Table">
          <img src={tableIcon} alt="Insert Table" style={{ width: 20, height: 20 }} /> {/* Use custom image */}
        </button>
        <button onClick={() => formatText('insertOrderedList')} aria-label="Numbered List" title="Numbered List"><FaListOl /></button>
        <button onClick={() => formatText('insertUnorderedList')} aria-label="Bulleted List" title="Bulleted List"><FaListUl /></button>
        <button onClick={() => handleAlignment('Left')} aria-label="Align Left" title="Align Left"><FaAlignLeft /></button>
        <button onClick={() => handleAlignment('Center')} aria-label="Align Center" title="Align Center"><FaAlignCenter /></button>
        <button onClick={() => handleAlignment('Right')} aria-label="Align Right" title="Align Right"><FaAlignRight /></button>
        <button onClick={() => formatText('insertHorizontalRule')} aria-label="Horizontal Rule" title="Horizontal Rule">HR</button>
        <button onClick={() => formatText('strikeThrough')} aria-label="Strikethrough" title="Strikethrough"><FaStrikethrough /> </button>
        <button onClick={handleInsertLink} aria-label="Insert Link" title="Insert Link"><FaLink /></button>
        <button onClick={handleClearFormatting} aria-label="Clear Formatting" title="Clear Formatting"><FaEraser /></button>
        <label aria-label="Text Color" title="Text Color">
          <FaHighlighter />
          <input
            type="color"
            value={textColor}
            onChange={(e) => handleTextColorChange(e.target.value)}
            title="Text Color"
            aria-label="Choose Text Color"
          />
        </label>

        {/* Highlight Color Button */}
        <label aria-label="Highlight Color" title="Highlight Color">
          <FaPalette />
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => handleHighlightColorChange(e.target.value)}
            title="Highlight Color"
            aria-label="Choose Highlight Color"
          />
        </label>
        <button onClick={handleIndent} aria-label="Indent" title="Indent"><FaIndent /></button>
        <button onClick={handleOutdent} aria-label="Outdent" title="Outdent"><FaOutdent /></button>
        <select onChange={handleFontStyleChange} aria-label="Font Style">
          <option value="">Font Style</option>
          <option value="Arial" style={{ fontFamily: 'Arial' }}>Arial</option>
          <option value="Calibri" style={{ fontFamily: 'Calibri' }}>Calibri</option>
          <option value="Cambria" style={{ fontFamily: 'Cambria' }}>Cambria</option>
          <option value="Candara" style={{ fontFamily: 'Candara' }}>Candara</option>
          <option value="Century Gothic" style={{ fontFamily: 'Century Gothic' }}>Century Gothic</option>
          <option value="Comic Sans MS" style={{ fontFamily: 'Comic Sans MS' }}>Comic Sans MS</option>
          <option value="Consolas" style={{ fontFamily: 'Consolas' }}>Consolas</option>
          <option value="Courier New" style={{ fontFamily: 'Courier New' }}>Courier New</option>
          <option value="Ebrima" style={{ fontFamily: 'Ebrima' }}>Ebrima</option>
          <option value="Franklin Gothic Medium" style={{ fontFamily: 'Franklin Gothic Medium' }}>Franklin Gothic Medium</option>
          <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
          <option value="Impact" style={{ fontFamily: 'Impact' }}>Impact</option>
          <option value="Lucida Console" style={{ fontFamily: 'Lucida Console' }}>Lucida Console</option>
          <option value="Microsoft Sans Serif" style={{ fontFamily: 'Microsoft Sans Serif' }}>Microsoft Sans Serif</option>
          <option value="Segoe UI" style={{ fontFamily: 'Segoe UI' }}>Segoe UI</option>
          <option value="Sitka Text" style={{ fontFamily: 'Sitka Text' }}>Sitka Text</option>
          <option value="Tahoma" style={{ fontFamily: 'Tahoma' }}>Tahoma</option>
          <option value="Times New Roman" style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
          <option value="Trebuchet MS" style={{ fontFamily: 'Trebuchet MS' }}>Trebuchet MS</option>
          <option value="Verdana" style={{ fontFamily: 'Verdana' }}>Verdana</option>
          <option value="Webdings" style={{ fontFamily: 'Webdings' }}>Webdings</option>
          <option value="Wingdings" style={{ fontFamily: 'Wingdings' }}>Wingdings</option>
        </select>
        <div style={{
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
}}>
  📝 Word Count: {getWordCount()}
</div>

        <select onChange={(e) => handleFontSizeChange(e)} aria-label="Font Size">
          <option value="" disabled selected>
            Font Size
          </option>
          <option value="1" style={{ fontSize: '10px' }}>10px</option>
          <option value="2" style={{ fontSize: '12px' }}>12px</option>
          <option value="3" style={{ fontSize: '16px' }}>16px</option>
          <option value="4" style={{ fontSize: '18px' }}>18px</option>
          <option value="5" style={{ fontSize: '24px' }}>24px</option>
          <option value="6" style={{ fontSize: '32px' }}>32px</option>
          <option value="7" style={{ fontSize: '48px' }}>48px</option>
        </select>
        <button onClick={handleInsertBookmark} aria-label="Insert Bookmark" title="Insert Bookmark">
          <FaBookmark />
        </button>
        <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
        <button onClick={toggleDarkMode} title="Toggle Dark Mode">🌙</button>

      </div>

      {showTableModal && (
        <div className="table-modal">
          <div className="table-modal-content">
            <h2>Select Table Size</h2>
            <div className="table-grid">
              {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="table-grid-row">
                  {[...Array(10)].map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className={`table-cell ${rowIndex < hoveredRows && colIndex < hoveredCols ? 'highlighted' : ''
                        }`}
                      onMouseEnter={() => {
                        setHoveredRows(rowIndex + 1);
                        setHoveredCols(colIndex + 1);
                      }}
                      // onClick={() => insertTableIntoEditor(rowIndex + 1, colIndex + 1)}
                      onClick={() => insertTableIntoEditor(colIndex + 1, rowIndex + 1)} // Swap row and column values

                    ></div>
                  ))}
                </div>
              ))}
            </div>
            <p>
              {hoveredRows} x {hoveredCols}
            </p>
            <button onClick={() => setShowTableModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div
        className="editing-area"
        contentEditable="true"
        spellCheck="true" // Add this line to enable spell check
        ref={editorRef} // Reference the editor area
        onInput={handleContentChange} // Track content change
        aria-label="Text Editor"
        placeholder="Start typing..."
        style={{ fontFamily: 'Arial' }} // Default font style
      />
    </div>
  );
};

export default TextEditor;
