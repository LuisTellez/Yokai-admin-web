// pageshow can precede the Flutter engine. Refresh geometry only after Flutter
// has rendered, and after returning from the background or the back/forward cache.
(function () {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!ios) return;

  let ready = false;
  let frame = null;
  let lastViewport = '';
  function cancelRefresh() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }
  function restoreGeometry() {
    if (document.visibilityState !== 'visible') {
      cancelRefresh();
      return;
    }
    if (!ready || frame !== null) return;
    frame = requestAnimationFrame(function () {
      frame = requestAnimationFrame(function () {
        frame = null;
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
  window.addEventListener('pagehide', cancelRefresh);
  document.addEventListener('visibilitychange', restoreGeometry);

  // Safari may restore the visible viewport after pageshow/visibilitychange
  // (keyboard, rotation, or returning from a suspended standalone window).
  // Compare geometry so our synthetic resize cannot create a resize loop.
  const viewport = window.visualViewport;
  if (viewport) {
    function viewportChanged() {
      const geometry = [viewport.width, viewport.height, viewport.offsetLeft,
        viewport.offsetTop, viewport.scale].join(':');
      if (geometry === lastViewport) return;
      lastViewport = geometry;
      restoreGeometry();
    }
    viewport.addEventListener('resize', viewportChanged);
    viewport.addEventListener('scroll', viewportChanged);
  }
}());
