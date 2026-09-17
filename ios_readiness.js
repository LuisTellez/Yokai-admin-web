// pageshow can precede the Flutter engine. Refresh geometry only after Flutter
// has rendered, and after returning from the background or the back/forward cache.
(function () {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!ios) return;

  let ready = false;
  let scheduled = false;
  function restoreGeometry() {
    if (!ready || scheduled || document.visibilityState !== 'visible') return;
    scheduled = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scheduled = false;
        if (document.visibilityState === 'visible') {
          window.dispatchEvent(new Event('resize'));
        }
      });
    });
  }

  window.addEventListener('flutter-first-frame', function () {
    ready = true;
    restoreGeometry();
  }, { once: true });
  window.addEventListener('pageshow', restoreGeometry);
  document.addEventListener('visibilitychange', restoreGeometry);
}());
