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

        if (entry.isDirectory()) {
          await scanDirectory(fullPath) // Recurse into subdirectories
        } else if (entry.isFile() && isSupportedExtension(entry.name)) {
          await extractFromFile(fullPath, results)
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${dirPath}:`, err)
    }
  }

  function isSupportedExtension(filename) {
    const ext = path.extname(filename).toLowerCase()
    return ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.md'].includes(ext)
  }

  async function extractFromFile(filePath, results) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('//SUMMARY:')) {
          results.push({
            file: path.relative(rootDir, filePath),
            lineNum: i + 1,
            content: lines[i].trim()
          })
        }
      }
    } catch (err) {
      console.error(`Error reading file ${filePath}:`, err)
    }
  }

  await scanDirectory(rootDir)
  return results
}

export const scanFolder = async (targetFolder) => {
  return await extractSummaryComments(targetFolder)
    .then((results) => {
      const csv = `File,Line Number,Content\n${results
        .map((r: any) => `"${r.file}",${r.lineNum},"${r.content.replace(/"/g, '""')}"`)
        .join('\n')}`

      return `
## current summary of each file at path
${csv}`
    })
    .catch((err) => {
      console.error('Script error:', err.message)
      return ''
    })
}
