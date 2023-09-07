const CACHE_NAME = 'ingeweb-cache-v9'; // Incrementamos la versión de la caché
const urlsToCache = [
    '/IngeWeb/',
    '/IngeWeb/index.html',
    '/IngeWeb/courses.html',
    '/IngeWeb/courseContent.html', // Añadido porque se modificó anteriormente
    '/IngeWeb/js/app.js',
    '/IngeWeb/js/auth.js',
    '/IngeWeb/js/courses.js',
    '/IngeWeb/js/courseContentScript.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css', // Actualizado a Bootstrap 5
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js', // Actualizado a Bootstrap 5
    'https://code.jquery.com/jquery-3.6.0.slim.min.js'
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
