const save = document.getElementById('save')
const web = document.getElementById('web')
const removebtn = document.getElementsByClassName('removeBtn')

function refreshList(blocked) {
  var text = ''
  var i
  for (i = 0; i < blocked.length; i++) {
    text += `
		<div class="site">
			<span class="sitename">
				${blocked[i]}
			</span>
			<img id="remove_${blocked[i]}" class="removeBtn" src="/assets/close.svg" class="close" alt="">
		</div>
		`
  }
  document.getElementById('demo').innerHTML = text
}

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

function removeSite(site) {
  chrome.storage.local.get(['blocked'], function (local) {
    const { blocked } = local
    newSites = blocked
    removeA(blocked, site)
    chrome.storage.local.set({ blocked: newSites })
    refreshList(newSites)
    activateRemoveListeners()
  })
}

function checkURL(site) {
  var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
  var regex = new RegExp(expression)

  if (site.toLowerCase().match(regex)) {
    return site
  } else {
    return false
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

web.addEventListener('keypress', function (e) {
  chrome.storage.local.get(['blocked', 'enabled'], function (local) {
    newSites = local.blocked
    if (e.key === 'Enter') {
      if (web.value.trim() !== '') {
        if (checkURL(web.value) !== false) {
          var convertedUrl = convertURL(web.value)
          var finalURL = trailingSlash(convertedUrl)
          if (
            finalURL.slice(0, 2) == '*.' &&
            newSites.indexOf(finalURL.slice(2)) !== -1
          ) {
            removeA(newSites, finalURL.slice(2))
            newSites.push(finalURL)
            local.blocked = newSites
            chrome.storage.local.set({ blocked: newSites })
            refreshList(local.blocked)
          } else if (
            newSites.indexOf(`*.${finalURL}`) == -1 &&
            newSites.indexOf(`${finalURL}`) == -1
          ) {
            newSites.push(finalURL)
            local.blocked = newSites
            chrome.storage.local.set({ blocked: newSites })
            refreshList(local.blocked)
          }
        } else {
          alert('Enter a valid URL.')
        }
        web.value = ''
        activateRemoveListeners()
      }
    }
  })
})

function activateRemoveListeners() {
  l = removebtn.length
  for (i = 0; i < l; i++) {
    removebtn[i].addEventListener('click', (tag) => {
      const target = tag.target.id.slice('remove_'.length)
      removeSite(target)
    })
  }
}

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['blocked', 'enabled'], function (local) {
    const { blocked, enabled } = local
    if (!Array.isArray(blocked)) {
      return
    }

    refreshList(blocked)
    activateRemoveListeners()
    document.getElementById('load').classList.add('ready')
  })
})
