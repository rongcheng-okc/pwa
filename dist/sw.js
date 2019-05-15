const cacheKey = 'v2';
const exculdes = ['manifest.json', 'index.html', 'vue.png'];
// const exculdes = ['index.html'];

function isValueInText(text) {
  let flag = false;
  for(let key in exculdes) {
    if (text.indexOf(exculdes[key]) > -1) {
      flag = true;
      break;
    }
  }
  return flag;
} 
this.addEventListener('install', function(event) {
  this.skipWaiting(); // 要么执行下面的语句，要么直接跳过
  // 即使这里添加了在 fetch 的事件里仍然会被覆盖
  // event.waitUntil(
  //   caches.open(cacheKey).then(function(cache) {
  //     return cache.addAll([
  //       '/image/chrome.png',
  //       '/image/vue.png',
  //     ]);
  //   })
  // );
});

this.addEventListener('activate', function(event) {
  console.log('Service worker activate.');
  // this.clients.claim(); // 本次注册的缓存获得了页面控制权，以前的缓存虽然存在，但是失效
  let cacheWhitelist = [cacheKey];
  let cacheNeedDeleteList = caches.keys().then(function(keyList) {
    return keyList.map(function(key) {
      if (cacheWhitelist.indexOf(key) === -1) {
        return caches.delete(key);
      }
    });
  });

  event.waitUntil(Promise.all[cacheNeedDeleteList]);
});

this.addEventListener('fetch', function(event) {
  if (isValueInText(event.request.url)) {
    return fetch(event.request).then(res => {
      return res;
    }).catch(e => {
      console.error(`没找到资源：${event.request.url}`);
    });
  }
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response !== undefined) {
      console.log(`存在缓存资源：${event.request.url}`);
      return response;
    } else {
      console.log(`首次加载不存在缓存资源：${event.request.url}`);
      return fetch(event.request).then(function (response) {
        let responseClone = response.clone();
        caches.open(cacheKey).then(function (cache) {
          cache.put(event.request, responseClone);
          console.log(`首次加载成功后保存缓存资源到 caches[${cacheKey}]：${event.request.url}`);
        });
        return response;
      }).catch(function () {
        console.log(`缓存出错了，返回默认资源`);
        return caches.match('/image/basketball.png');
      });
    }
  }));
});