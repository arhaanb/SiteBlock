chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(['blocked', 'enabled'], function (local) {
    if (!Array.isArray(local.blocked)) {
      chrome.storage.local.set({ blocked: [] })
    }

    if (typeof local.enabled !== 'boolean') {
      chrome.storage.local.set({ enabled: true })
    }
  })
})

function convertURL(site) {
  var web = site.toLowerCase()
  if (web.slice(0, 8) === 'https://') {
    if (web.slice(0, 12) === 'https://www.') {
      return web.slice(12)
    }
    return web.slice(8)
  } else if (web.slice(0, 7) === 'http://') {
    if (web.slice(0, 11) === 'http://www.') {
      return web.slice(11)
    }
    return web.slice(7)
  } else if (web.slice(0, 4) === 'www.') {
    return web.slice(4)
  } else {
    return web
  }
}

chrome.webNavigation.onCommitted.addListener(function (details) {
  const url = details.url
  if (!url || !url.startsWith('http')) {
    return
  }

  const hostname = new URL(url).hostname
  var host = convertURL(hostname)

  chrome.storage.local.get(['blocked', 'enabled'], function (local) {
    const { blocked, enabled } = local

    if (blocked && Array.isArray(blocked) && blocked.length > 0) {
      blocked.forEach((site) => {
        if (site.slice(0, 2) == '*.') {
          if (site.slice(2) == host) {
            chrome.tabs.remove(details.tabId)
          } else if (
            site.slice(1) == host.slice(parseInt(`-${site.slice(1).length}`))
          ) {
            chrome.tabs.remove(details.tabId)
          }
        } else {
          if (host == site) {
            chrome.tabs.remove(details.tabId)
          }
        }
      })
    }
  })
})
