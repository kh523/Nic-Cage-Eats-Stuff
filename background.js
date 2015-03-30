chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('game.html', {
  	state: "maximized"
  });
});