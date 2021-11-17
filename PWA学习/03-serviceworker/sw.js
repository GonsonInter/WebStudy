self.addEventListener('install', event => {
  console.log('install', event);

  // 让service worker跳过等待，直接进入到activate状态
  event.waitUntil( self.skipWaiting() );
});

self.addEventListener('activate', event => {
  console.log('activate', event);

  // service worker激活后立即获取控制权，而不是下次进入再控制
  event.waitUntil( self.clients.claim() );
});


// fetch事件会在请求发起时触发
self.addEventListener('fetch', event => {
  console.log('fetch', event);
});
