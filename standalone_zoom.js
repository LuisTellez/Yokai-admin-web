// Installed PWAs behave like native applications: keep their viewport fixed.
// Normal browser tabs retain zoom for accessibility.
(function () {
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  window.yokaiIsStandalone = isStandalone;
  if (!isStandalone()) return;

  document.documentElement.classList.add('yokai-standalone-app');

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, ' +
        'user-scalable=no, viewport-fit=cover'
    );
  }

  function preventZoom(event) {
    if (event.cancelable) event.preventDefault();
  }

  // iOS exposes pinch as gesture events in standalone web apps.
  document.addEventListener('gesturestart', preventZoom, { passive: false });
  document.addEventListener('gesturechange', preventZoom, { passive: false });
  document.addEventListener('gestureend', preventZoom, { passive: false });

  // Desktop PWAs may receive trackpad pinch as Ctrl/Command + wheel.
  document.addEventListener('wheel', function (event) {
    if (event.ctrlKey || event.metaKey) preventZoom(event);
  }, { passive: false });

  // Prevent keyboard zoom shortcuts in installed desktop PWAs.
  document.addEventListener('keydown', function (event) {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (['+', '-', '=', '0'].includes(event.key)) preventZoom(event);
  });
}());
