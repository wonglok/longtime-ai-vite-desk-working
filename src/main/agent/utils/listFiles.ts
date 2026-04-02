import fs from 'fs/promises'
import path from 'path'
/**
 * Recursively reads folder and extracts lines with "//SUMMARY:"
 */
async function extractSummaryComments(rootDir) {
  const results = []

  async function scanDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (fullPath.includes('node_modules')) {
          continue
        }
        if (fullPath.includes('.next')) {
          continue
        }
        if (fullPath.includes('ai-memory')) {
          continue
        }
        if (fullPath.includes('venv')) {
          continue
        }
        if (fullPath.includes('__pycache__')) {
          continue
        }

        if (entry.isDirectory()) {
          await scanDirectory(fullPath) // Recurse into subdirectories
          results.push({
            parent: path.relative(rootDir, dirPath),
            filePath: path.relative(rootDir, fullPath),
            isDir: true,
            content: ''
          })
        } else if (entry.isFile()) {
          // && isSupportedExtension(entry.name)
          await extractFromFile(fullPath, results, path.relative(rootDir, dirPath))
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${dirPath}:`, err)
    }
  }

  // function isSupportedExtension(filename) {
  //   const ext = path.extname(filename).toLowerCase()
  //   return ['.js', '.ts', '.jsx', '.tsx', '.json', '.md'].includes(ext)
  // }

  async function extractFromFile(filePath, results, parent) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')

      results.push({
        parent: parent,
        filePath: path.relative(rootDir, filePath),
        isDir: false,
        content: content
      })
    } catch (err) {
      console.error(`Error reading file ${filePath}:`, err)
    }
  }

  await scanDirectory(rootDir)
  return results
}

export const listFiles = async (targetFolder) => {
  return await extractSummaryComments(targetFolder)
    .then((results) => {
      return results
    })
    .catch((err) => {
      console.error('Script error:', err.message)
      return []
    })
}
