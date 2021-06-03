const CACHE_NAME = 'cache_v1';

self.addEventListener('install', async event => {
  // 开启一个cache，得到一个cache对象
  const cache = await caches.open(CACHE_NAME);
  // cache对象可以存储资源
  await cache.addAll([
      '/',
      '/豆瓣.png',
      '/manifest.json',
      '/index.css'
  ])

  await self.skipWaiting();
});

self.addEventListener('activate', async event => {

  // 清除掉旧的资源
  const keys = await caches.keys();

  keys.forEach(key => {
    if (key !== CACHE_NAME) {
      caches.delete(key);
    }
  })
  await self.clients.claim();
});


// fetch事件会在请求发起时触发
self.addEventListener('fetch', event => {

  // 判断资源能否请求成功，如果能够请求成功则返回请求结果，不能成功就返回caches缓存
  const req = event.request;
  // 给浏览器响应
  event.respondWith(networkFirst(req));
});

// 网络优先
async function networkFirst(req) {
  try {
    return await fetch(req);
  } catch (e) {
    const cache = await caches.open(CACHE_NAME);
    return cache.match(req);
  }

}

// 缓存优先
function cacheFirst() {

}
