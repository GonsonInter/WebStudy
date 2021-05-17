if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(params) {
    navigator.serviceWorker.register('./static/se-demo', {
      scope: './static/'
    }).then(registration => {

    }).catch(error => {

    });
  })
}
