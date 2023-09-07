if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/IngeWeb/service-worker.js')
    .then(reg => {
      console.log('Service Worker registrado con éxito:', reg);
    }).catch(err => {
      console.warn('Error al registrar el Service Worker:', err);
    });
}
