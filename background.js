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

function myFunction(item, index) {
  document.getElementById('demo').innerHTML += index + ':' + item + '<br>'
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  const url = changeInfo.pendingUrl || changeInfo.url
  if (!url || !url.startsWith('http')) {
    return
  }

  const hostname = new URL(url).hostname

  chrome.storage.local.get(['blocked', 'enabled'], function (local) {
    const { blocked, enabled } = local

    if (blocked !== []) {
      blocked.forEach((site) => {
        if (hostname.includes(site)) {
          chrome.tabs.remove(tabId)
        }
      })
    }
  })
})
