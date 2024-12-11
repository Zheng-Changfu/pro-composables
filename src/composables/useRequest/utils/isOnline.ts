import isBrowser from '../../../utils/isBrowser'

export function isOnline() {
  if (isBrowser && typeof navigator.onLine !== 'undefined') {
    return navigator.onLine
  }
  return true
}
