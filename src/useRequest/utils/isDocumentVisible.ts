import isBrowser from '../../utils/isBrowser'

export function isDocumentVisible() {
  if (isBrowser) {
    return document.visibilityState !== 'hidden'
  }
  return true
}
