const template = 'Object.defineProperty(navigator,"userAgent",{get:function(){return"$"}}),Object.defineProperty(navigator,"vendor",{get:function(){return""}}),Object.defineProperty(navigator,"platform",{get:function(){return""}});'

chrome.storage.local.get(null, state => {
  if (state.enabled) {
    const ua = state.custom ? state.customUA : state.browsers[state.browser][state.os].ua
    const script = document.createElement('script')
    script.innerText = template.replace('$', ua.replace(/[='"\\]/g, ''))
    document.head.appendChild(script)
  }
})
