export const StreamFilesFormat = `

# File Output Foramtting

- for writing a code file
[BLOCK_TAG type="code" path="{path}"]
{content}
[/BLOCK_TAG]

- for running terminal
[BLOCK_TAG type="terminal" extra=""]
{command}
[/BLOCK_TAG]

- for writing next step
[BLOCK_TAG type="next-step" extra=""]
{content}
[/BLOCK_TAG]

- for writing log
[BLOCK_TAG type="log" extra=""]
{content}
[/BLOCK_TAG]

- for ending the process
[BLOCK_TAG type="goal-achieved" extra=""]
{content}
[/BLOCK_TAG]

- {path} is the file path 
- {extra} is the extra info
- {content} is the content of the tag
`

/**
 * BLOCK_TAG Parser - TypeScript Functions
 * Extracts structured blocks from content using regex
 */

// Type definitions
interface BlockTag {
  type: string
  path: string | null
  extra: string
  content: string
  raw: string
}

interface ParseOptions {
  trimContent?: boolean
}

/**
 * Extracts all fenced code blocks from a markdown string.
 * @param {string} markdownString The input markdown content.
 * @returns {string[]} An array of extracted code block contents.
 */
function extractCodeBlocks(markdownString) {
  // Regex to find all fenced code blocks and capture their content.
  // The 'g' flag is for global search, and 's' allows '.' to match newlines.
  const regex = /```(?:\w+\n|\n)([\s\S]*?)\n```/g

  // Use matchAll to get all occurrences and capturing groups.
  // The spread operator converts the iterator to an array.
  const matches = [...markdownString.matchAll(regex)]

  // Map the matches to return only the content of the captured group (index 1).
  const codeBlocks = matches.map((match) => match[1])

  return codeBlocks
}

// // Example Usage:
// const markdownText = `
// Here is some general text and an inline code \`example\`.

// And here is a JavaScript code block:
// \`\`\`javascript
// console.log('Hello, world!');
// function foo() {
//   return 'bar';
// }
// \`\`\`

// Another block without a language specifier:
// \`\`\`
// def my_func():
//     print("Python or something")
// \`\`\`

// That's all.
// `

// const extractedBlocks = extractCodeBlocks(markdownText)
// console.log(extractedBlocks)

// Output:
// [
//   "console.log('Hello, world!');\nfunction foo() {\n  return 'bar';\n}",
//   'def my_func():\n    print("Python or something")'
// ]

/**
 * Parse content and extract all BLOCK_TAG elements
 * @param content - The raw content to parse
 * @param options - Optional parsing options
 * @returns Array of parsed block objects
 */
function parseBlockTags(content: string, options: ParseOptions = {}): BlockTag[] {
  const { trimContent = true } = options

  // Regex pattern to match BLOCK_TAG format
  const blockPattern =
    /\[BLOCK_TAG\s+type="([^"]*)"(?:\s+path="([^"]*)")?(?:\s+extra="([^"]*)")?\]([\s\S]*?)\[\/BLOCK_TAG\]/g

  const blocks: BlockTag[] = []
  let match: RegExpExecArray | null

  while ((match = blockPattern.exec(content)) !== null) {
    let content = trimContent ? match[4].trim() : match[4]
    content = content.replace(/\`\`\`python/gi, '')

    content = content.replace(/\`\`\`js/gi, '')

    content = content.replace(/\`\`\`jsx/gi, '')

    content = content.replace(/\`\`\`javascript/gi, '')

    content = content.replace(/\`\`\`ts/gi, '')

    content = content.replace(/\`\`\`tsx/gi, '')

    content = content.replace(/\`\`\`typescript/gi, '')

    content = content.replace(/\`\`\`/gi, '')

    console.log('content', content)

    blocks.push({
      type: match[1],
      path: match[2] || null,
      extra: match[3] || '',
      content: content,
      raw: match[0]
    })
  }

  return blocks
}

/**
 * Parse single BLOCK_TAG (non-global)
 * @param content - The raw content
 * @param options - Optional parsing options
 * @returns Single block object or null
 */
function parseOneBlockTag(content: string, options: ParseOptions = {}): BlockTag | null {
  const { trimContent = true } = options

  const singlePattern =
    /\[BLOCK_TAG\s+type="([^"]*)"(?:\s+path="([^"]*)")?(?:\s+extra="([^"]*)")?\]([\s\S]*?)\[\/BLOCK_TAG\]/
  const match = content.match(singlePattern)

  if (!match) return null

  return {
    type: match[1],
    path: match[2] || null,
    extra: match[3] || '',
    content: trimContent ? match[4].trim() : match[4],
    raw: match[0]
  }
}

/**
 * Filter blocks by type
 * @param blocks - Parsed blocks array
 * @param type - Type to filter by
 * @returns Filtered blocks
 */
function filterBlocksByType(blocks: BlockTag[], type: string): BlockTag[] {
  return blocks.filter((block) => block.type === type)
}

/**
 * Extract content only (without tags) for specific type
 * @param content - Raw content
 * @param type - Optional type filter
 * @returns Concatenated content string
 */
function extractBlockContent(content: string, type?: string): string {
  let blocks = parseBlockTags(content)

  if (type) {
    blocks = filterBlocksByType(blocks, type)
  }

  return blocks.map((b) => b.content).join('\n\n')
}

/**
 * Check if content contains a specific block type
 * @param content - Raw content
 * @param type - Type to check for
 * @returns Boolean indicating presence
 */
function hasBlockType(content: string, type: string): boolean {
  const blocks = parseBlockTags(content)
  return blocks.some((block) => block.type === type)
}

/**
 * Get unique block types in content
 * @param content - Raw content
 * @returns Array of unique type names
 */
function getBlockTypes(content: string): string[] {
  const blocks = parseBlockTags(content)
  return [...new Set(blocks.map((block) => block.type))]
}

// // ==========================================
// // USAGE EXAMPLES
// // ==========================================

// const sampleContent = `
// [BLOCK_TAG type="code" path="example.ts"]
// function greet(name: string): string {
//   return \`Hello, \${name}!\`;
// }
// [/BLOCK_TAG]

// [BLOCK_TAG type="terminal" extra="run in project root"]
// npm install && npm run build
// [/BLOCK_TAG]

// [BLOCK_TAG type="next-step" extra="priority: high"]
// Add error handling to the API
// [/BLOCK_TAG]
// `

// // Parse all blocks
// const allBlocks = parseBlockTags(sampleContent)
// console.log('All blocks:', allBlocks)

// // Parse single
// const single = parseOneBlockTag(`[BLOCK_TAG type="log" extra=""]System initialized[/BLOCK_TAG]`)
// console.log('Single:', single)

// // Filter by type
// const codeBlocks = filterBlocksByType(allBlocks, 'code')
// console.log('Code blocks:', codeBlocks)

// // Extract content only
// const codeContent = extractBlockContent(sampleContent, 'code')
// console.log('Code content:', codeContent)

// // Check for type
// console.log('Has terminal?', hasBlockType(sampleContent, 'terminal')) // true
// console.log('Has image?', hasBlockType(sampleContent, 'image')) // false

// // Get all types
// console.log('Types found:', getBlockTypes(sampleContent)) // ["code", "terminal", "next-step"]

// Export functions
export {
  parseBlockTags,
  parseOneBlockTag,
  filterBlocksByType,
  extractBlockContent,
  hasBlockType,
  getBlockTypes,
  type BlockTag,
  type ParseOptions
}
