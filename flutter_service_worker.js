'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "36934f376940e624d7a07e22cb6a7c48",
"assets/assets/fonts/OpenSans-Regular.ttf": "3ed9575dcc488c3e3a5bd66620bdf5a4",
"assets/assets/fonts/poppins_regular.ttf": "e212f84086965da44a6c84f3d9a683a4",
"assets/assets/fonts/sansserif.ttf": "93db7e2038fb1d2d5b5c2f692c48472b",
"assets/assets/fonts/Ubuntu-Medium.ttf": "8e22c2a6e3a3c679787e763a97fa11f7",
"assets/assets/images/bg.svg": "346688458384060095dcc99704c3663c",
"assets/assets/images/bg_img.png": "e80d0a0130de36b94c7fecd3eafa0505",
"assets/assets/images/bg_splash_grey.png": "5677bf831298e3adf7105ab627208a69",
"assets/assets/images/bg_splash_grey_web.png": "1deb28af72f29bcb6fcf694d3ae7176a",
"assets/assets/images/error.png": "cfa94d1e5da653f5305df6b0e2989dc3",
"assets/assets/images/header.png": "dbbd68d687a5019025b8ef485afaf5fe",
"assets/assets/images/header1.png": "9ebd4dcc6233bc3d398ff31d590e9900",
"assets/assets/images/k8.png": "e907871e8cb48d00301a3d6904a0bfe6",
"assets/assets/images/no_record.png": "8aae8241481f6887a3ed5ef049a76de3",
"assets/assets/images/school0.png": "56410725ab4c51c25e086675b2ffd2d3",
"assets/assets/images/school1.png": "e1072c2b7091e8d4c0fc4ddb5b9d3574",
"assets/assets/images/school2.png": "e921fb9b79f9263ba4eadd707e1f05c3",
"assets/assets/images/school3.png": "39ff45021438cde668ce96a8751dac27",
"assets/assets/images/student_active.png": "1756d279b065f8babc54b22f1d295d21",
"assets/assets/images/student_inactive.png": "f5ec4a361c2ad5e52150cc48a8fe30d6",
"assets/assets/images/subject.png": "efd1704a50e809c0c310bc78e35d9b24",
"assets/assets/images/subject_science.jpg": "10c0f3183ee1056f42320e4cd0978826",
"assets/assets/images/sushant.jpg": "a4ed02bd8a92734fc189b211ca339af9",
"assets/assets/images/sushant.png": "98a5bff1ba7bd40a780cebc46ba59286",
"assets/assets/images/teacher_active.png": "75384f920ed997ac19bb534c12581cc7",
"assets/assets/images/teacher_inactive.png": "f14eb28c84fefc88e56f9fee9ee84a91",
"assets/FontManifest.json": "19cd390b2c9bece2a6049ec4ab7e9160",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "011b9c72ff441e0e6e0f444f8af30027",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "2427915628e8f76dce61c1e1bb27f759",
"/": "2427915628e8f76dce61c1e1bb27f759",
"main.dart.js": "041876b8ae974604b48e907eee9b99a0",
"manifest.json": "45336657ef10976ab0411fb3d2e21781",
"version.json": "a60d7b24ff0539e50bb1890c4836e369"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
