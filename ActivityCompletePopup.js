window.App = window.App || {};
(function(App){
  var ActivityCompletePopup = function(parentNode, dispatcher, style) {
    this.initialize(parentNode, dispatcher, style);
  };

  var p = ActivityCompletePopup.prototype = new App.Popup();
  p.popupInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher, style) {
    this.popupInitialize(parentNode, dispatcher, style);
    this.setSize(600, 500);
    this.addOkay(_backToHome.bind(this));
    this.okay.textContent = "Done";
    this.hide();
    this.setTitle('Activity Complete!');
    ALXUI.styleEl(this.title, headerStyle);
  };

  p.preloadYoutube = function(url){
    _destroyYoutube.apply(this);
    _addYoutube.apply(this, [url]);
  };

  p.popupShow = p.show;
  p.show = function(url){
    this.popupShow();
    if(window.navigator.onLine && url && _isYoutubeUrl.apply(this, [url])){
      this.setSize(600, 500);
      _addYoutube.apply(this, [url]);
    } else {
      this.setSize(600, 150);
      _destroyYoutube.apply(this);
    }
  };

  function _addYoutube(url){
    if(!this.youtubeIframe){
      var vidId = _extractVideoId.apply(this, [url]);
      var src = 'https://www.youtube.com/embed/' + vidId + '?html5=1';
      this.youtubeIframe = ALXUI.addEl(this.div, 'iframe', youtubeStyle);
      this.youtubeIframe.src = src;
      this.youtubeIframe.setAttribute("allowfullscreen", true);
    }
  }

  function _extractVideoId(url){
    if(url.indexOf('v=') !== -1){
      return url.split('v=')[1].split('&')[0];
    } else if(url.indexOf('embed/') !== -1){
      return url.split('embed/')[1].split('?')[0].split('/')[0];
    } else if(url.indexOf('youtu.be/') !== -1){
      return url.split('youtu.be/')[1].split('?')[0];
    }
  }

  function _isYoutubeUrl(url){
    return url.indexOf('youtu.be') !== -1 ||
        url.indexOf('youtube.com') !== -1;
  }

  function _backToHome(){
    this.dispatcher.trigger('backToHome');
    this.hide();
    _destroyYoutube.apply(this);
  }

  function _destroyYoutube(){
    if(this.youtubeIframe && this.youtubeIframe.parentNode == this.div){
      this.div.removeChild(this.youtubeIframe);
      delete this.youtubeIframe;
    }
  }

  var youtubeStyle = {
    margin: 100,
    width: 400,
    height: 300,
    marginTop: 25,
  };

  var headerStyle = {
    color: App.DARK_BLUE,
    fontFamily: App.MAIN_FONT,
    fontSize: 50,
  };

  App.ActivityCompletePopup = ActivityCompletePopup;
}(App));