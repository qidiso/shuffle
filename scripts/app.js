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

Face = function() {};

Face.prototype = {
  lipPositions: { top: 60, bottom: 57 },
  eyePositions: { left: 27, right: 32 },
  eyeLipScaler: 2.5,
  lipsClosedThreshold: 12,

  lipsAreClosed: function() {
    return (this.distanceBetweenLips < this.lipsClosedThreshold);
  },

  getDistanceBetweenPoints: function(points) {
    return Math.round(Math.sqrt(Math.pow((points[0][0] - points[1][0]), 2) + Math.pow((points[0][1] - points[1][1]), 2)));
  },

  setMaxMouth: function() {
    this.maxMouth = this.distanceBetweenEyes / this.eyeLipScaler;
    return this.maxMouth;
  },

  setScaledDistanceBetweenLips: function() {
    this.scaledDistanceBetweenLips = Math.round((this.distanceBetweenLips / this.maxMouth) * 100)
    return this.scaledDistanceBetweenLips;
  },

  consumePositions: function(currentPositions) {
    this.distanceBetweenLips = this.getDistanceBetweenPoints([currentPositions[this.lipPositions.top], currentPositions[this.lipPositions.bottom]]);
    this.distanceBetweenEyes = this.getDistanceBetweenPoints([currentPositions[this.eyePositions.left], currentPositions[this.eyePositions.right]]);
    this.setMaxMouth();
    this.setScaledDistanceBetweenLips();
    return true;
  }
}

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
    face.consumePositions(currentPositions);
    console.log(face.scaledDistanceBetweenLips);
    ctrack.draw(overlay);
  }
}

var face = new Face();
startVideo()