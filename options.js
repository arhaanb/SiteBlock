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
    return site.toLowerCase()
  } else {
    return false
  }
}

function convertURL(site) {
  if (site.slice(0, 8).toLowerCase() === 'https://') {
    return site.slice(8).toLowerCase()
  } else if (site.slice(0, 7).toLowerCase() === 'http://') {
    return site.slice(7).toLowerCase()
  } else {
    return site.toLowerCase()
  }
}

web.addEventListener('keypress', function (e) {
  chrome.storage.local.get(['blocked', 'enabled'], function (local) {
    newSites = local.blocked
    if (e.key === 'Enter') {
      if (web.value.trim() !== '') {
        if (newSites.indexOf(web.value) === -1) {
          if (checkURL(web.value) !== false) {
            newSites.push(convertURL(web.value))
            local.blocked = newSites
            chrome.storage.local.set({ blocked: newSites })
            refreshList(local.blocked)
          } else {
            alert('Enter a valid URL.')
          }
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
