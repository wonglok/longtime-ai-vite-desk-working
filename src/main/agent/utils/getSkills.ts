import fs from 'fs/promises'
import path from 'path'
/**
 * Recursively reads folder and extracts lines with "//SUMMARY:"
 */
async function extractSkills(rootDir) {
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
    const ext = path.basename(filename).toLowerCase()
    return ['skill.md'].includes(ext)
  }

  async function extractFromFile(filePath, results) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      results.push({
        file: path.relative(rootDir, filePath),
        content: content
      })
    } catch (err) {
      console.error(`Error reading file ${filePath}:`, err)
    }
  }

  await scanDirectory(rootDir)
  return results
}

export const getSkills = async (targetFolder) => {
  return await extractSkills(targetFolder)
    .then((results) => {
      const csv = `\n${results
        .map(
          (r: any) => `
------- SKILL BEGIN ------
Skill filepath: ${r.file}\n\n
Skill content:
${r.content}
------- SKILL END ------
`
        )
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
