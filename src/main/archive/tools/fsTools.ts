import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import z from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import { makeDirectory } from 'make-dir'
import trash from 'trash'

/**
 * Recursively list all files in a directory and its subdirectories.
 * @param {string} dirPath The absolute or relative path to the directory.
 * @param {string[]} [fileList] An optional array to accumulate file paths.
 * @returns {string[]} An array of absolute file paths.
 */
const getAllFiles = (dirPath, fileList: string[] = []) => {
  // Read the contents of the current directory
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    // Construct the full path to the current item
    const fullPath = path.join(dirPath, file)

    // Check if the item is a directory
    if (fs.statSync(fullPath).isDirectory()) {
      // If it's a directory, recursively call the function
      getAllFiles(fullPath, fileList)
    } else {
      // If it's a file, add its full path to the list
      fileList.push(fullPath)
    }
  })

  return fileList
}

export const prepToolReadFile = ({ workspace = '~/loklok/' }) => ({
  name: 'readFile',
  description: 'read file content at relative path',
  input: z.object({
    relativePath: z.string()
  }),
  output: z.object({}),
  execute: async ({ relativePath }) => {
    await makeDirectory(path.dirname(join(workspace, relativePath)))

    return readFile(join(workspace, relativePath), 'utf-8')
  }
})

export const prepToolListFiles = ({ workspace = '~/loklok/' }) => ({
  name: 'listFiles',
  description: 'list all files at relative path',
  input: z.object({
    relativePath: z.string().default('./')
  }),
  output: z.object({
    list: z.array(
      z.object({
        isDirectory: z.boolean(),
        relativePath: z.string()
      })
    )
  }),
  execute: async ({ relativePath }) => {
    await makeDirectory(path.dirname(join(workspace, relativePath)))

    return getAllFiles(join(workspace, relativePath), [])
  }
})

export const prepToolWriteFile = ({ workspace = '~/loklok/' }) => ({
  name: 'writeFile',
  description: 'write file content at relative path',
  input: z.object({
    relativePath: z.string().describe('file path'),
    content: z.string().describe('file content')
  }),
  output: z.object({}),
  execute: async ({ relativePath, content }) => {
    await makeDirectory(path.dirname(join(workspace, relativePath)))

    await writeFile(join(workspace, relativePath), content)

    return {}
  }
})

export const prepToolCreateFolder = ({ workspace = '~/loklok/' }) => ({
  name: 'createFolder',
  description: 'create folder at relative path',
  input: z.object({
    relativePath: z.string().describe('file relativePath')
  }),
  output: z.object({}),
  execute: async ({ relativePath }) => {
    await makeDirectory(path.dirname(join(workspace, relativePath)))

    return {}
  }
})

export const prepToolTrashFolder = ({ workspace = '~/loklok/' }) => ({
  name: 'trashFolder',
  description: 'trash folder at relative path',
  input: z.object({
    relativePath: z.string().describe('file relativePath')
  }),
  output: z.object({}),
  execute: async ({ relativePath }) => {
    await trash([path.dirname(join(workspace, relativePath))])
    return {}
  }
})

export const prepToolTrashFile = ({ workspace = '~/loklok/' }) => ({
  name: 'trashFile',
  description: 'trash file at relative path',
  input: z.object({
    relativePath: z.string().describe('file relativePath')
  }),
  output: z.object({}),
  execute: async ({ relativePath }) => {
    await trash([join(workspace, relativePath)])
    return {}
  }
})
