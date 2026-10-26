/* globals __BROWSER_INDICATOR__, __SABER_DEV_CLIENT_ID__ */
import client from 'webpack-hot-middleware/client'

const INDICATOR_ID = '__saber-compile-indicator__'
const INDICATOR_STYLE_ID = '__saber-compile-indicator-style__'

const createCompileIndicator = () => {
  if (typeof document === 'undefined') {
    return null
  }

  let timeoutId = null

  if (!document.getElementById(INDICATOR_STYLE_ID)) {
    const style = document.createElement('style')
    style.id = INDICATOR_STYLE_ID
    style.textContent = `
      #${INDICATOR_ID} {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        pointer-events: none;
        opacity: 0;
        transform: scale(0.85);
        transition: opacity 0.15s ease, transform 0.15s ease;
      }
      #${INDICATOR_ID}.is-visible {
        opacity: 1;
        transform: scale(1);
      }
      #${INDICATOR_ID} svg {
        width: 22px;
        height: 22px;
        animation: __saber-indicator-spin__ 0.8s linear infinite;
      }
      @keyframes __saber-indicator-spin__ {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
  }

  let el = document.getElementById(INDICATOR_ID)
  if (!el) {
    el = document.createElement('div')
    el.id = INDICATOR_ID
    el.setAttribute('aria-hidden', 'true')
    el.setAttribute('title', 'Compiling...')
    el.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#eaeaea" stroke-width="3"></circle>
        <path d="M21 12a9 9 0 0 0-9-9" stroke="#111111" stroke-width="3" stroke-linecap="round"></path>
      </svg>
    `
    document.body.appendChild(el)
  }

  return {
    show() {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      el.classList.add('is-visible')
    },
    hide() {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        el.classList.remove('is-visible')
      }, 100)
    }
  }
}

export const init = ({ router }) => {
  window.__SABER_DEV_CLIENT_ID__ = Math.random()
    .toString(36)
    .substring(7)

  const indicator =
    typeof __BROWSER_INDICATOR__ !== 'undefined' && __BROWSER_INDICATOR__
      ? createCompileIndicator()
      : null

  let isClientBuilding = false
  let areAllCompilersReady = true

  client.subscribeAll(obj => {
    if (!obj) return

    if (indicator) {
      if (obj.action === 'building') {
        isClientBuilding = true
        indicator.show()
      } else if (obj.action === 'built') {
        isClientBuilding = false
        if (areAllCompilersReady) {
          indicator.hide()
        }
      } else if (obj.action === 'saber:compiler-status') {
        areAllCompilersReady = Boolean(
          obj.allCompilers && obj.allCompilers.ready
        )
        if (!areAllCompilersReady || obj.status === 'building') {
          indicator.show()
        } else if (!isClientBuilding) {
          indicator.hide()
        }
      }
    }

    if (obj.action === 'router:push' && obj.id === __SABER_DEV_CLIENT_ID__) {
      if (obj.hasError) {
        console.error(`You need to refresh the page when the error is fixed!`)
      }

      if (obj.alreadyBuilt) {
        router.push(obj.route)
      } else {
        const handler = status => {
          if (status === 'idle') {
            module.hot.removeStatusHandler(handler)
            router.push(obj.route)
          }
        }

        module.hot.addStatusHandler(handler)
      }
    }
  })
}
