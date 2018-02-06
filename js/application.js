// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  var gameManager = new GameManager(document.querySelector(".game-container").offsetWidth, KeyboardInputManager, HTMLActuator, LocalScoreManager);
});
