var vid       = document.getElementById('mirror');
var overlay   = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack    = new clm.tracker({ useWebGL : true });
ctrack.init(pModel);

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

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

function lipsAreClosed(distanceBetweenLips) {
  return (distanceBetweenLips < 4);
}

function getDistanceBetweenPoints(points) {
  return Math.round(Math.sqrt(Math.pow((points[0][0] - points[1][0]), 2) + Math.pow((points[0][1] - points[1][1]), 2)));
}

function getMaxMouth(distanceBetweenEyes) {
  return distanceBetweenEyes / 2;
}

function getScaledDistanceBetweenLips(distanceBetweenLips, maxMouth) {
  return Math.round((distanceBetweenLips / maxMouth) * 100);
}

function startVideo() {
  vid.play();
  ctrack.start(vid);
  drawLoop();
}

function drawLoop() {
  requestAnimationFrame(drawLoop);
  overlayCC.clearRect(0, 0, 400, 300);
  if (currentPositions = ctrack.getCurrentPosition()) {
    var distanceBetweenLips       = getDistanceBetweenPoints([currentPositions[57], currentPositions[60]]);
    var distanceBetweenEyes       = getDistanceBetweenPoints([currentPositions[27], currentPositions[32]]);
    var maxMouth                  = getMaxMouth(distanceBetweenEyes);
    var scaledDistanceBetweenLips = getScaledDistanceBetweenLips(distanceBetweenLips, maxMouth);

    console.log(scaledDistanceBetweenLips);
    ctrack.draw(overlay);
  }
}

startVideo()