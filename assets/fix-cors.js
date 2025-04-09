// 强制所有 fetch 请求添加 CORS 头
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (typeof url === 'string' && url.startsWith('http')) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Origin'] = window.location.origin;
    options.mode = 'cors';
  }
  return originalFetch(url, options);
};

// 强制所有 XHR 请求添加 CORS 头
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
  originalOpen.apply(this, arguments);
  if (typeof url === 'string' && url.startsWith('http')) {
    this.setRequestHeader('Origin', window.location.origin);
  }
};