function removeA(arr) {
  var what,
    a = arguments,
    L = a.length,
    ax
  while (L > 1 && arr.length) {
    what = a[--L]
    while ((ax = arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1)
    }
  }
  return arr
}

function trailingSlash(site) {
  if (site.includes('/')) {
    var n = site.search('/')
    return site.slice(0, n)
  } else {
    return site
  }
}

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

document.getElementById('blockbtn').addEventListener('click', function () {
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function (tabs) {
      chrome.storage.local.get(['blocked', 'enabled'], function (local) {
        newSites = local.blocked
        var convertedUrl = convertURL(tabs[0].url)
        var finalURL = trailingSlash(convertedUrl)
        if (
          finalURL.slice(0, 2) == '*.' &&
          newSites.indexOf(finalURL.slice(2)) !== -1
        ) {
          removeA(newSites, finalURL.slice(2))
          newSites.push(finalURL)
          local.blocked = newSites
          chrome.storage.local.set({ blocked: newSites })
        } else if (
          newSites.indexOf(`*.${finalURL}`) == -1 &&
          newSites.indexOf(`${finalURL}`) == -1
        ) {
          newSites.push(finalURL)
          local.blocked = newSites
          chrome.storage.local.set({ blocked: newSites })
        }

        chrome.tabs.remove(tabs[0].id)
      })
    },
  )
})