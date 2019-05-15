// 首先引入workbox框架
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.precaching.precacheAndRoute([
  // 注册成功后要立即缓存的资源列表，处于 installing 状态
])
const v = 3;
const obj = {
  prefix: `prefix${v}`,
  suffix: `suffix${v}`,
  precache: `precache${v}`,
  runtime: `runtime${v}`,
  img: `img${v}`,
  css: `css${v}`,
  js: `js${v}`,
};

const imgCacheName = obj.img;
const cssCacheName = obj.css;
const jsCacheName = obj.js;

workbox.core.setCacheNameDetails({
  prefix: obj.prefix,
  suffix: obj.suffix,
  precache: obj.precache,
  runtime: obj.runtime,
});

self.addEventListener('install', (event) => {
  console.log('ServiceWorker install');
  workbox.core.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activate');
  let list = caches.keys().then(keyList => { // 此时读到的缓存是旧的，所以新key 读不到，就删除了
    console.log(keyList);
    keyList.map(key => {
      console.log(key);
      if (!obj.hasOwnProperty(key)) {
        return caches.delete(key);
      }
    });
  });
  event.waitUntil(Promise.all[list]);
});


// html的缓存策略, networkFirst 保证了离线可访问
workbox.routing.registerRoute(
  /\.html$/,
  new workbox.strategies.NetworkFirst()
);

workbox.routing.registerRoute(
  /\.js$/,
  new workbox.strategies.NetworkFirst({
    cacheName: jsCacheName,
  })
);

workbox.routing.registerRoute(
  /\.css$/,
  new workbox.strategies.NetworkFirst({
    cacheName: cssCacheName,
  })
);

workbox.routing.registerRoute(
  /.*\.(?:jpg|png)/,
  new workbox.strategies.CacheFirst({
    cacheName: imgCacheName,
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 2,
        maxAgeSeconds: 2 * 60,
      })
    ],
  })
);

workbox.routing.registerRoute(
  /https:\/\/thirdsite\//,
  new workbox.strategies.StaleWhileRevalidate()
);