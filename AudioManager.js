/**
 * Created by Alex on 12/30/13.
 */
window.App = window.App || {};
(function(App){

  var soundMap = {
    stepComplete: 'images/ding.txt'
  };

  var AudioManager = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = AudioManager.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.baseInitialize(parentNode, dispatcher);
    this.hide();
    this.bufferMap = {};
    try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext||window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGainNode();
      this.gainNode.connect(this.audioContext.destination);
    }
    catch(e) {
      console.log('Web Audio API is not supported in this browser');
    }
    for(var x in soundMap){
      _loadSound.apply(this, [x, soundMap[x]]);
    }
    this.dispatcher.bind("playSound", _playSound, this);
  };

  function _playSound(soundName, volume){
    if(volume || volume === 0){
      this.gainNode.gain.value = volume;
    } else {
      this.gainNode.gain.value = 0.5;
    }
    var source = this.audioContext.createBufferSource();
    source.buffer = this.bufferMap[soundName];
    source.connect(this.gainNode);
    source.start(0);
  }

  function _loadSound(soundName, soundUrl) {
    var request = new XMLHttpRequest();
    request.open('GET', soundUrl, true);
    request.responseType = 'text/plain';
    // Decode asynchronously
    request.onload = function() {
        var buff = Base64Binary.decodeArrayBuffer(request.response);
        this.audioContext.decodeAudioData(buff, function(data){
          this.bufferMap[soundName] = data;
        }.bind(this), function(err){ console.log(err);});
    }.bind(this);
    request.send();
  }

  App.AudioManager = AudioManager;
}(App));