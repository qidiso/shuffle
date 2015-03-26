var vid       = document.getElementById('mirror');
var overlay   = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack    = new clm.tracker({ useWebGL : true });
ctrack.init(pModel);

function enablestart() {
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "start";
  startbutton.disabled = null;
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
// check for camerasupport

if (navigator.getUserMedia) {
  navigator.getUserMedia({ video : true }, function(stream) {
    if (vid.mozCaptureStream) {
      vid.mozSrcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    }
    vid.play();
  }, function() {
    alert("There was some problem trying to fetch video from your webcam.");
  });
} else {
  alert("Your browser does not seem to support getUserMedia.");
}
vid.addEventListener('canplay', enablestart, false);

function startVideo() {
  // start video
  vid.play();
  // start tracking
  ctrack.start(vid);
  // start loop to draw face
  drawLoop();
}

function drawLoop() {
  requestAnimationFrame(drawLoop);
  overlayCC.clearRect(0, 0, 400, 300);
  if (ctrack.getCurrentPosition()) {
    ctrack.draw(overlay);
  }
}

startVideo()