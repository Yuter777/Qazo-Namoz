import { ElMessage } from 'element-plus'

// Tracks currently displayed messages to prevent identical duplicates stacking
const _active = new Set()

function show({ type, message, duration, showClose = true, ...rest }) {
  const key = `${type}:${message}`
  if (_active.has(key)) return
  _active.add(key)
  ElMessage({
    type,
    message,
    duration: duration ?? (type === 'error' ? 4500 : 3000),
    showClose,
    ...rest,
    onClose() {
      _active.delete(key)
      rest.onClose?.()
    },
  })
}

export const showSuccess = (message, opts = {}) =>
  show({ type: 'success', message, ...opts })

export const showError = (message, opts = {}) =>
  show({ type: 'error', message, ...opts })

export const showWarning = (message, opts = {}) =>
  show({ type: 'warning', message, ...opts })

export const showInfo = (message, opts = {}) =>
  show({ type: 'info', message, ...opts })
