const CACHE_NAME = 'ingeweb-cache-v8';
const urlsToCache = [
    '/IngeWeb/',
    '/IngeWeb/index.html',
    '/IngeWeb/courses.html',
    '/IngeWeb/js/app.js',
    '/IngeWeb/js/auth.js',
    '/IngeWeb/js/courses.js',
    '/IngeWeb/js/courseContentScript.js',
    '/IngeWeb/js/SCORM_API_wrapper.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js',
    'https://code.jquery.com/jquery-3.5.1.slim.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'cache-scorm') {
        caches.open(CACHE_NAME).then((cache) => {
            cache.add(event.data.url);
        });
    }
});
