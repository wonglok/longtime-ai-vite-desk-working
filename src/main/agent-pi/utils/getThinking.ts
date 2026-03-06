export function getThinkingWords(text) {
  // Regex: <think> = literal, ([\s\S]*?) = non-greedy capture, <\/think> = closing
  const regex = /<think>([\s\S]*?)<\/think>/gi
  const match = regex.exec(text)

  if (match && match[1]) {
    return match[1].trim()
  } else {
    return text
  }
}
