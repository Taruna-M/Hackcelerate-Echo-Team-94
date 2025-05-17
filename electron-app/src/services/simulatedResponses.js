/**
 * Simulated code-related responses for the fallback mechanism
 * Used when actual API calls fail due to CSP restrictions
 */

// Sample responses with markdown formatting
const sampleResponses = [
  // HTML Example
  {
    id: 'html-example',
    content: "Here's a styled HTML page example:\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Echo IDE Example</title>\n  <style>\n    body {\n      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n      max-width: 800px;\n      margin: 0 auto;\n      padding: 20px;\n      background-color: #f5f9fc;\n      color: #333;\n    }\n    h1 {\n      color: #0078d4;\n      border-bottom: 2px solid #0078d4;\n      padding-bottom: 10px;\n    }\n    .container {\n      background: white;\n      border-radius: 8px;\n      box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n      padding: 20px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>Welcome to Echo IDE</h1>\n    <p>This is a simple, styled HTML example.</p>\n  </div>\n</body>\n</html>\n```\n\nThis HTML page includes:\n- Basic HTML5 structure\n- Embedded CSS styling\n- Responsive design elements\n- Modern visual styling with shadows and rounded corners"
  },
  
  // JavaScript Example
  {
    id: 'js-example',
    content: "Here's a JavaScript function that could improve your code:\n\n```javascript\n/**\n * Processes code input with enhanced error handling\n * @param {string} code - The code to process\n * @param {Object} options - Processing options\n * @returns {Object} The processed result\n */\nfunction processCodeInput(code, options = {}) {\n  // Default options\n  const defaults = {\n    validate: true,\n    format: true,\n    timeout: 3000\n  };\n  \n  // Merge options\n  const settings = { ...defaults, ...options };\n  \n  try {\n    // Input validation\n    if (!code || typeof code !== 'string') {\n      throw new Error('Invalid code input: must be a non-empty string');\n    }\n    \n    // Process with timeout\n    const result = { \n      processed: settings.format ? formatCode(code) : code,\n      timestamp: new Date().toISOString(),\n      success: true\n    };\n    \n    return result;\n  } catch (error) {\n    console.error('Code processing error:', error);\n    return {\n      success: false,\n      error: error.message,\n      timestamp: new Date().toISOString()\n    };\n  }\n}\n\n// Helper function for code formatting\nfunction formatCode(code) {\n  // Formatting logic would go here\n  return code.trim();\n}\n```\n\nThis function includes:\n- Proper error handling with try/catch\n- Default parameter options with destructuring\n- JSDoc comments for better documentation\n- A modular approach with helper functions"
  },
  
  // React Component Example
  {
    id: 'react-example',
    content: "Here's a React component that could be useful for your project:\n\n```jsx\nimport React, { useState, useEffect } from 'react';\n\n/**\n * CodeSuggestionPanel - A component that displays code suggestions\n * @param {Object} props - Component props\n * @returns {JSX.Element} The rendered component\n */\nconst CodeSuggestionPanel = ({ codeContext, onSuggestionApply }) => {\n  const [suggestions, setSuggestions] = useState([]);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n  \n  useEffect(() => {\n    if (!codeContext) return;\n    \n    const fetchSuggestions = async () => {\n      setLoading(true);\n      setError(null);\n      \n      try {\n        // Simulate API call for code suggestions\n        const response = await new Promise(resolve => {\n          setTimeout(() => {\n            resolve([\n              { id: 1, text: 'Add error handling to this function' },\n              { id: 2, text: 'Use destructuring for cleaner code' },\n              { id: 3, text: 'Consider adding TypeScript types' }\n            ]);\n          }, 800);\n        });\n        \n        setSuggestions(response);\n      } catch (err) {\n        setError('Failed to fetch suggestions');\n        console.error(err);\n      } finally {\n        setLoading(false);\n      }\n    };\n    \n    fetchSuggestions();\n  }, [codeContext]);\n  \n  return (\n    <div className=\"code-suggestion-panel\">\n      <h3>Code Suggestions</h3>\n      \n      {loading && <div className=\"loading-indicator\">Loading suggestions...</div>}\n      {error && <div className=\"error-message\">{error}</div>}\n      \n      <ul className=\"suggestions-list\">\n        {suggestions.map(suggestion => (\n          <li key={suggestion.id} className=\"suggestion-item\">\n            {suggestion.text}\n            <button \n              onClick={() => onSuggestionApply(suggestion)}\n              className=\"apply-button\"\n            >\n              Apply\n            </button>\n          </li>\n        ))}\n      </ul>\n      \n      {suggestions.length === 0 && !loading && !error && (\n        <p className=\"no-suggestions\">No suggestions available for current code.</p>\n      )}\n    </div>\n  );\n};\n\nexport default CodeSuggestionPanel;\n```\n\nThis React component includes:\n- Proper state management with useState and useEffect\n- Loading and error states\n- Clean, organized structure with meaningful variable names\n- JSX with appropriate className attributes for styling\n- Comments and documentation"
  }
];

/**
 * Get a simulated response based on the user's query
 * @param {string} query - The user's query
 * @param {string} modelId - The model ID for display purposes
 * @returns {Object} A formatted response object
 */
export const getSimulatedResponse = (query, modelId) => {
  query = query.toLowerCase();
  
  // Determine which sample to use based on the query
  let responseContent;
  
  if (query.includes('html') || query.includes('webpage') || query.includes('page')) {
    responseContent = sampleResponses.find(r => r.id === 'html-example').content;
  } else if (query.includes('react') || query.includes('component')) {
    responseContent = sampleResponses.find(r => r.id === 'react-example').content;
  } else {
    responseContent = sampleResponses.find(r => r.id === 'js-example').content;
  }
  
  // If the query is asking for analysis, provide a different response
  if (query.includes('analyze') || query.includes('review') || query.includes('improve')) {
    responseContent = "I've analyzed your code and here are some suggestions:\n\n1. **Error Handling**: Consider adding try/catch blocks around network requests and file operations.\n\n2. **Code Organization**: Breaking down large functions into smaller, single-responsibility functions would improve readability.\n\n3. **Performance**: I noticed potential performance issues with repeated DOM manipulations. Consider using DocumentFragment for batch updates.\n\n4. **Documentation**: Adding JSDoc comments to your functions would make your code more maintainable.\n\n5. **Accessibility**: Some UI elements are missing proper ARIA attributes for screen readers.\n\nWould you like me to help implement any of these suggestions?";
  }
  
  // Return formatted response object
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: responseContent
      },
      finish_reason: 'stop'
    }],
    model: modelId
  };
};
