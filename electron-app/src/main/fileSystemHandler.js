/**
 * File System Handler for Electron
 * Provides functions for reading and writing files, getting directory structure, etc.
 */

const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Recursively get the file tree structure
 * @param {string} dir - Directory path to scan
 * @param {number} depth - Current depth (for recursion)
 * @param {number} maxDepth - Maximum depth to traverse
 * @returns {Array} Array of file and directory objects
 */
function getDirectoryTree(dir, depth = 0, maxDepth = 5) {
  if (depth > maxDepth) return [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const result = [];
    
    for (const item of items) {
      // Skip hidden files and directories (starting with .)
      if (item.name.startsWith('.')) continue;
      
      const itemPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // It's a directory
        result.push({
          name: item.name,
          path: itemPath,
          type: 'directory',
          children: getDirectoryTree(itemPath, depth + 1, maxDepth)
        });
      } else if (item.isFile()) {
        // It's a file
        result.push({
          name: item.name,
          path: itemPath,
          type: 'file',
          // Don't include content by default as it could be large
        });
      }
    }
    
    // Sort directories first, then files, both alphabetically
    return result.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
    return [];
  }
}

/**
 * Read a file's content
 * @param {string} filePath - Path to the file
 * @returns {Object} Object with file content and metadata
 */
function readFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    
    return {
      content,
      size: stats.size,
      lastModified: stats.mtime,
      path: filePath,
      name: path.basename(filePath)
    };
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    throw err;
  }
}

/**
 * Write content to a file
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 * @returns {Object} Status object
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, path: filePath };
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    throw err;
  }
}

/**
 * Open a folder dialog and return the selected folder's file tree
 * @param {BrowserWindow} window - The browser window to attach the dialog to
 * @returns {Object} Object with root path and file tree
 */
async function openFolder(window) {
  try {
    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory']
    });
    
    if (result.canceled) {
      return { canceled: true };
    }
    
    const folderPath = result.filePaths[0];
    const tree = getDirectoryTree(folderPath);
    
    return {
      success: true,
      root: folderPath,
      tree
    };
  } catch (err) {
    console.error('Error opening folder:', err);
    throw err;
  }
}

/**
 * Get the file tree for the current working directory
 * @returns {Object} Object with root path and file tree
 */
function getFileTree() {
  try {
    const currentDir = process.cwd();
    const tree = getDirectoryTree(currentDir);
    
    return {
      success: true,
      root: currentDir,
      tree
    };
  } catch (err) {
    console.error('Error getting file tree:', err);
    throw err;
  }
}

module.exports = {
  getDirectoryTree,
  readFile,
  writeFile,
  openFolder,
  getFileTree
};
