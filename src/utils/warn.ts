const warnedMessages = new Set()

export function warnOnce(message: string) {
  if (warnedMessages.has(message))
    return
  warnedMessages.add(message)
  console.error(message)
}
