import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  
  // Spell-check states
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [misspelledWord, setMisspelledWord] = useState('');
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const suggestionRef = useRef(null);


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
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      
      try {
        // Extract the selected content
        const selectedContent = range.extractContents();
        
        // Create a span with the background color
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.appendChild(selectedContent);
        
        // Insert the highlighted content back
        range.insertNode(span);
        
        // Restore the selection
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      } catch (error) {
        // Fallback to execCommand if there's an error
        document.execCommand('hiliteColor', false, color);
      }
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

  // Spell-check functions
  const handleContextMenu = useCallback(async (e) => {
    if (!spellCheckEnabled) return;
    
    const target = e.target;
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    if (range) {
      // Get the word at cursor position
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const offset = range.startOffset;
        
        // Find word boundaries
        let start = offset;
        let end = offset;
        
        // Find start of word
        while (start > 0 && /\w/.test(text[start - 1])) {
          start--;
        }
        
        // Find end of word
        while (end < text.length && /\w/.test(text[end])) {
          end++;
        }
        
        const word = text.substring(start, end);
        
        if (word && word.length > 2) {
          // Check if word might be misspelled using API
          const spellingSuggestions = await getSpellingSuggestions(word);
          
          if (spellingSuggestions.length > 0) {
            e.preventDefault();
            setMisspelledWord(word);
            setSuggestions(spellingSuggestions);
            
            // Position the suggestion box near the cursor
            const rect = range.getBoundingClientRect();
            const editorRect = editorRef.current.getBoundingClientRect();
            
            setSuggestionPosition({
              top: rect.bottom - editorRect.top + 5,
              left: rect.left - editorRect.left
            });
            
            setShowSuggestions(true);
          }
        }
      }
    }
  }, [spellCheckEnabled]);

  // Levenshtein distance algorithm for finding similar words
  const levenshteinDistance = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,    // deletion
            dp[i][j - 1] + 1,    // insertion
            dp[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }
    return dp[m][n];
  };

  const getSpellingSuggestions = async (word) => {
    const lowerWord = word.toLowerCase();
    
    // Check if word is valid using Free Dictionary API
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lowerWord}`);
      
      if (response.ok) {
        // Word exists in dictionary, no suggestions needed
        return [];
      } else {
        // Word not found - generate suggestions using Levenshtein distance
        // Fallback to common words for suggestion generation
        const commonWords = [
          'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'as', 'you', 'do', 'at',
          'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'will', 'one', 'all', 'would', 'there',
          'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'when', 'make', 'can', 'like', 'time',
          'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
          'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
          'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
          'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having', 'should', 'called', 'world', 'find', 'made',
          'life', 'where', 'through', 'much', 'before', 'right', 'something', 'need', 'place', 'another', 'tell', 'does', 'every',
          'being', 'between', 'under', 'last', 'never', 'really', 'more', 'very', 'long', 'little', 'still', 'must', 'own',
          'different', 'same', 'here', 'such', 'great', 'each', 'help', 'ask', 'change', 'end', 'try', 'large', 'turn', 'hand',
          'high', 'off', 'follow', 'play', 'live', 'become', 'around', 'form', 'three', 'seem', 'number', 'part', 'both', 'against',
          'until', 'several', 'house', 'without', 'school', 'important', 'leave', 'put', 'old', 'while', 'mean', 'keep', 'learn',
          'thing', 'become', 'might', 'system', 'program', 'question', 'during', 'always', 'away', 'far', 'small', 'however',
          'group', 'problem', 'fact', 'again', 'office', 'hand', 'company', 'show', 'government', 'public', 'able', 'money',
          'provide', 'service', 'point', 'lost', 'person', 'become', 'hold', 'read', 'happen', 'bring', 'begin', 'run', 'move',
          'example', 'increase', 'rather', 'later', 'once', 'early', 'interest', 'present', 'case', 'white', 'moment', 'believe',
          'open', 'perhaps', 'include', 'continue', 'community', 'allow', 'though', 'experience', 'believe', 'appear', 'child',
          'lead', 'already', 'head', 'national', 'woman', 'matter', 'level', 'along', 'development', 'let', 'black', 'council',
          'door', 'stand', 'week', 'whether', 'full', 'certain', 'behind', 'support', 'following', 'mother', 'soon', 'return',
          'less', 'across', 'possible', 'together', 'information', 'nothing', 'yet', 'create', 'side', 'special', 'within',
          'receive', 'separate', 'necessary', 'available', 'business', 'development', 'language', 'education', 'different',
          'friend', 'student', 'family', 'member', 'position', 'product', 'research', 'policy', 'support', 'consider',
          'almost', 'enough', 'process', 'political', 'similar', 'difficult', 'evidence', 'remember', 'beautiful', 'various',
          'especially', 'success', 'forward', 'decision', 'although', 'individual', 'situation', 'difference', 'amount',
          'general', 'realize', 'involve', 'continue', 'establish', 'control', 'whether', 'therefore', 'certainly', 'social'
        ];
        
        const suggestions = [];
        const maxDistance = 2;
        
        for (const dictWord of commonWords) {
          const distance = levenshteinDistance(lowerWord, dictWord);
          if (distance > 0 && distance <= maxDistance) {
            suggestions.push({ word: dictWord, distance });
          }
        }
        
        suggestions.sort((a, b) => a.distance - b.distance);
        return suggestions.slice(0, 5).map(s => s.word);
      }
    } catch (error) {
      // If API fails, return empty suggestions
      console.log('Spell check API unavailable, using browser spell-check');
      return [];
    }
  };

  const replaceMisspelledWord = (suggestion) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const offset = range.startOffset;
        
        // Find word boundaries
        let start = offset;
        let end = offset;
        
        // Find start of word
        while (start > 0 && /\w/.test(text[start - 1])) {
          start--;
        }
        
        // Find end of word
        while (end < text.length && /\w/.test(text[end])) {
          end++;
        }
        
        // Replace the word
        const newText = text.substring(0, start) + suggestion + text.substring(end);
        node.textContent = newText;
        
        // Update cursor position
        const newRange = document.createRange();
        newRange.setStart(node, start + suggestion.length);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    setShowSuggestions(false);
    setSuggestions([]);
    setMisspelledWord('');
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
        {/* Spell Check Toggle */}
        <button 
          onClick={() => setSpellCheckEnabled(!spellCheckEnabled)} 
          aria-label="Toggle Spell Check" 
          title={spellCheckEnabled ? "Disable Spell Check" : "Enable Spell Check"}
          style={{ backgroundColor: spellCheckEnabled ? '#4CAF50' : 'transparent' }}
        >
          ✓ABC
        </button>
        
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
        
        <select onChange={(e) => handleFontSizeChange(e)} aria-label="Font Size">
          <option value="" disabled>
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
                      onClick={() => insertTableIntoEditor(rowIndex + 1, colIndex + 1)}

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

      {/* Spell Check Suggestions Popup */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionRef}
          className="spell-suggestions"
          style={{
            position: 'absolute',
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`,
            backgroundColor: darkMode ? '#333' : '#fff',
            border: `1px solid ${darkMode ? '#666' : '#ccc'}`,
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
            maxWidth: '200px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
            Suggestions for "{misspelledWord}":
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => replaceMisspelledWord(suggestion)}
              style={{
                padding: '4px 8px',
                cursor: 'pointer',
                borderRadius: '2px',
                fontSize: '14px',
                backgroundColor: darkMode ? '#444' : '#f9f9f9',
                marginBottom: '2px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#555' : '#e0e0e0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#444' : '#f9f9f9'}
            >
              {suggestion}
            </div>
          ))}
          <button
            onClick={() => setShowSuggestions(false)}
            style={{
              marginTop: '4px',
              padding: '4px 8px',
              width: '100%',
              fontSize: '12px',
              cursor: 'pointer',
              backgroundColor: darkMode ? '#555' : '#e0e0e0',
              border: 'none',
              borderRadius: '2px'
            }}
          >
            Close
          </button>
        </div>
      )}

      <div
        className="editing-area"
        contentEditable="true"
        spellCheck={spellCheckEnabled}
        ref={editorRef}
        onInput={handleContentChange}
        onContextMenu={handleContextMenu}
        aria-label="Text Editor"
        placeholder="Start typing..."
        style={{ fontFamily: 'Arial' }}
      />
      
      {/* Word Count - Fixed positioning at bottom */}
      <div className="word-count-display">
        📝 Word Count: {getWordCount()}
      </div>
    </div>
  );
};

export default TextEditor;
