// FS-01..03: fullscreen is a view adapter; it never touches simulation state.
export function installFullscreen({button, dialog, message, root = document.documentElement}) {
  const standalone = () => matchMedia('(display-mode: standalone)').matches ||
    matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
  const activeElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const sync = () => {
    const active = !!activeElement();
    button.textContent = active ? 'Exit fullscreen' : 'Fullscreen';
    button.setAttribute('aria-pressed', String(active || standalone()));
    window.dispatchEvent(new Event('resize'));
  };
  const explain = text => {message.textContent = text; if (!dialog.open) dialog.showModal();};
  button.addEventListener('click', async () => {
    try {
      if (activeElement()) {
        const exit = document.fullscreenElement ? document.exitFullscreen : document.webkitExitFullscreen;
        if (!exit) throw new Error('Fullscreen exit unavailable');
        await exit.call(document);
      } else if (standalone()) {
        explain('You are already playing without the browser address bar.');
      } else {
        const enter = root.requestFullscreen || root.webkitRequestFullscreen;
        if (!enter) {
          explain('This browser cannot hide its address bar from a game button. On iPhone or iPad, open this page in Safari, tap Share → Add to Home Screen, then open ChopperJohn from that icon to play without the address bar.');
          return;
        }
        // Call directly in the tap handler to retain browser user activation.
        await enter.call(root, {navigationUI: 'hide'});
      }
      sync();
    } catch {
      sync();
      explain('Fullscreen was unavailable or blocked. Try the Fullscreen button again. On iPhone or iPad, open this page in Safari and use Share → Add to Home Screen, then launch the icon to play without the address bar.');
    }
  });
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
  sync();
}
