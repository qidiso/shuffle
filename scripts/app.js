(function() {
  Face = function() {
    this.scaledDistancesToAvg = [];
  };

  Face.prototype = {
    lipPositions: { top: 60, bottom: 57 },
    eyePositions: { left: 27, right: 32 },
    eyeLipScaler: 2.5,
    lipsClosedThreshold: 12,
    distancesToAvgCount: 10,

    lipsAreClosed: function() {
      return (this.avgScaledDistanceBetweenLips < this.lipsClosedThreshold);
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

    setAvgScaledDistanceBetweenLips: function() {
      var total = this.scaledDistancesToAvg.reduce(function(sum, num) { return sum + num; });
      this.avgScaledDistanceBetweenLips = total / this.scaledDistancesToAvg.length
      return this.avgScaledDistanceBetweenLips;
    },

    addScaledDistanceToList: function() {
      if (this.scaledDistancesToAvg.length > this.distancesToAvgCount) this.scaledDistancesToAvg.shift();
      this.scaledDistancesToAvg.push(this.scaledDistanceBetweenLips);
    },

    consumePositions: function(currentPositions) {
      this.distanceBetweenLips = this.getDistanceBetweenPoints([currentPositions[this.lipPositions.top], currentPositions[this.lipPositions.bottom]]);
      this.distanceBetweenEyes = this.getDistanceBetweenPoints([currentPositions[this.eyePositions.left], currentPositions[this.eyePositions.right]]);
      this.setMaxMouth();
      this.setScaledDistanceBetweenLips();
      this.addScaledDistanceToList();
      this.setAvgScaledDistanceBetweenLips();
      return true;
    }
  }

  Vizualizer = function() {
    this.$elem    = document.getElementById('color-bg');
    this.elemCtx  = this.$elem.getContext('2d');
    this.hsvColor = {};
    this.setRandomColor();
  };

  Vizualizer.prototype = {
    height: 1,
    width: 1,

    changeColor: function(face) {
      this.hsvColor.v = face.avgScaledDistanceBetweenLips / 100;
      if (face.lipsAreClosed()) this.setRandomColor();
      this.setRgbColor();
      this.elemCtx.fillStyle = this.rgbColorString();
      this.elemCtx.clearRect(0, 0, this.width, this.height);
      this.elemCtx.fillRect(0, 0, this.width, this.height);
    },

    setRandomColor: function() {
      this.hsvColor.h = Math.random();
      this.hsvColor.s = Math.random();
    },

    rgbColorString: function(rgbColor) {
      var rgbColor = rgbColor || this.rgbColor;
      return "rgb("+rgbColor.r+","+rgbColor.g+","+rgbColor.b+")";
    },

    oppositeRgbColorString: function() {
      var oppositeRgbColor = this.hsvToRgb({
        h: this.hsvColor.h,
        s: this.hsvColor.s,
        v: (1 - this.hsvColor.v),
      });
      return this.rgbColorString(oppositeRgbColor);
    },

    setRgbColor: function() {
      this.rgbColor = this.hsvToRgb(this.hsvColor);
    },

    hsvToRgb: function(hsvColor) {
      var r, g, b, i, f, p, q, t,
          h = hsvColor.h,
          s = hsvColor.s,
          v = hsvColor.v;

      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
      }

      var rgbColor = {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
      };
      return rgbColor;
    }
  }

  function resize() {
    [$mirror, $overlay].forEach(function($el) {
      $el.setAttribute('width', $container.offsetWidth);
      $el.setAttribute('height', ($container.offsetWidth * .75));
    });
    $container.style.top = (window.innerHeight * .5) - ($container.offsetHeight * .75) + 'px';
  }

  function startVideo() {
    $mirror.play();
    ctrack.start($mirror);
    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    overlayCxt.clearRect(0, 0, 800, 600);
    if (currentPositions = ctrack.getCurrentPosition()) {
      face.consumePositions(currentPositions);
      viz.changeColor(face);
      ctrack.draw($overlay, undefined, 'normal', 7, viz.oppositeRgbColorString());
    }
  }

  // init

  var $container = document.getElementById('container');
  var $mirror    = document.getElementById('mirror');
  var $overlay   = document.getElementById('overlay');
  var overlayCxt = $overlay.getContext('2d');
  resize()

  var ctrack     = new clm.tracker({ useWebGL : true });
  ctrack.init(pModel);

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({ video : true }, function(stream) {
      if ($mirror.mozCaptureStream) {
        $mirror.mozSrcObject = stream;
      } else {
        $mirror.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
      }
    }, function() {
      alert("There was some problem trying to fetch video from your webcam.");
    });
  } else {
    alert("Your browser does not seem to support getUserMedia.");
  }

  var face = new Face();
  var viz = new Vizualizer();
  startVideo()
})();