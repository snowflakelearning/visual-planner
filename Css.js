window.App = window.App || {};
(function(App){
  App.css = {};

  App.MAIN_FONT = 'Oxygen';
  App.DARK_BLUE = '#0d5f8c';

  App.css.addTransitionStyle = function(attr, obj, dur){
    var str = '';
    for(var i = 0; i < attr.length; i++){
      str += attr[i] + ' ' + dur + 's' + ', ';
    }
    str = str.substr(0, str.length -2);
    obj.style.webkitTransition = str;
    obj.style.mozTransition = str;
    obj.style.msTransition = str;
    obj.style.oTransition = str;
    obj.style.transition = str;

  };

  App.css.addMouseOver = function(el, onStyle, offStyle){
    el.addEventListener('mouseover', function(){
      ALXUI.styleEl(el, onStyle);
    });
    el.addEventListener('mouseout', function(){
      ALXUI.styleEl(el, offStyle);
    });
  };

  App.css.addTransitionEnd = function(obj, callback, context) {
    var func = callback.bind(context);
    obj.addEventListener('webkitTransitionEnd', func);
    obj.addEventListener('transitionEnd', func);
    return func;
  };

  App.css.removeTransitionEnd = function(obj, func){
    obj.removeEventListener('webkitTransitionEnd', func);
    obj.removeEventListener('transitionEnd', func);
  };

  App.css.generateRotationStyle = function(degX, degY){
    return {
      webkitTransform: 'rotateX(' + degX + 'deg) rotateY(' + degY + 'deg)',
      mozTransform: 'rotateX(' + degX + 'deg) rotateY(' + degY + 'deg)',
      transform: 'rotateX(' + degX + 'deg) rotateY(' + degY + 'deg)',
      webkitTransformPerspective: 'preserve-3d',
      mozTransformPerspective: 'preserve-3d',
      transformPerspective: 'preserve-3d',
    }
  };

  App.css.setScaleTransform = function(obj, scaleX, scaleY, origin) {
    obj.style.webkitTransform = 'scaleX(' + scaleX + ')' +
        'scaleY(' + scaleY + ')';
    obj.style.mozTransform = 'scaleX(' + scaleX + ')' +
        'scaleY(' + scaleY + ')';
    obj.style.transform = 'scaleX(' + scaleX + ')' +
        'scaleY(' + scaleY + ')';
    if(origin){
      obj.style.transformOrigin = origin;
      obj.style.mozTransformOrigin = origin;
      obj.style.webkitTransformOrigin = origin;
    }
  };

  App.css.appendTransform = function(obj, transform){
    obj.style.webkitTransform = obj.style.webkitTransform + ' ' + transform;
    obj.style.mozTransform = obj.style.mozTransform + ' ' + transform;
    obj.style.transform = obj.style.transform + ' ' + transform;
  }

  App.css.setCenteredAbsoluteStyle = function(div, width, height){
    var style = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: width,
      height: height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
    };
    ALXUI.styleEL(div, style);
  };

  App.css.generateBrowserSpecificGradient = function(
      col1, col2, type, pos1, pos2) {
    if(type == 'linear' || !type) {
      var gradientArgString = '(top,' + col1 + ',' + col2 + ')';
      if(App.css.browserIsIE()){
        if(App.css.getIEVersion() < 11) {
          return "-ms-linear-gradient" + gradientArgString;
        } else {
          return 'linear-gradient' + gradientArgString;
        }
      } else if(!App.css.browserIsFirefox()) {
        return "-webkit-linear-gradient" + gradientArgString
      } else {
        return "-moz-linear-gradient" + gradientArgString
      }
    } else if(type == 'radial') {
      if(App.css.browserIsOpera() ||
              (App.css.browserIsIE() && App.css.getIEVersion() === 11)) {
        return 'radial-gradient(closest-corner circle at ' +
            pos1 + ' ' + pos2 + ', ' + col1 + ', ' + col2 + ')';
      } else if(App.css.browserIsIE()){
        return '-ms-radial-gradient(' + pos1 + ' ' + pos2 +
            ', circle closest-corner, ' + col1 + ', ' + col2 + ')';
      } else if(!App.css.browserIsFirefox()) {
        return '-webkit-radial-gradient(' + pos1 + ' ' +
            pos2 + ', circle closest-corner, ' + col1 + ', ' + col2 + ')';
      } else {
        return '-moz-radial-gradient(' + pos1 + ' ' +
            pos2 + ', circle closest-corner, ' + col1 + ', ' + col2 + ')';
      }
    }
  };

  App.css.browserIsFirefox = function() {
    return navigator.userAgent.indexOf('Firefox') != -1;
  };

  App.css.browserIsOpera = function() {
    return navigator.userAgent.indexOf('Opera') != -1;
  };

  App.css.browserIsIE = function() {
    return window.ActiveXObject || "ActiveXObject" in window;
  };

  App.css.getIEVersion = function(){
    if(this.browserIsIE()){
      return parseInt(navigator.userAgent.split('MSIE ')[1].split(';'));
    } else {
      return null;
    }
  }

  App.css.browserIsChrome = function() {
    return navigator.userAgent.indexOf('Chrome') != -1;
  };

  App.css.osIsMac = function () {
    return navigator.userAgent.indexOf('Mac OS X') != -1;
  };

  App.css.osIsAndroid = function() {
    return navigator.userAgent.indexOf('Android') != -1;
  };

  App.css.osIsIOS = function() {
    return navigator.userAgent.indexOf('like Mac OS X') != -1;
  };

  App.css.browserIsSafari = function() {
    return !App.css.browserIsChrome() &&
        navigator.userAgent.indexOf('Safari') != -1;
  };

  App.css.generateBrowserCalcString = function(innerCalc){
    if(App.css.browserIsSafari()){
      return '-webkit-calc(' + innerCalc + ')'
    } else {
      return 'calc(' + innerCalc + ')';
    }
  };

  //TODO!
  App.css.addTouchClickEvent = function(el, callback, context){
    var func = function(e){
      callback.apply(context, [e]);
    };

    var eventType = App.css.osIsIOS() ? 'touchstart' : 'click';
    el.addEventListener(eventType, func);
    el.alxuiTouchClickListener = func;
  };

  App.css.removeTouchClickEvent = function(el){
    if(el.alxuiTouchClickListener){
      var eventType = App.css.osIsIOS() ? 'touchstart' : 'click';
      el.removeEventListener(eventType, el.alxuiTouchClickListener);
    }
  };

  App.css.fixWidth = function(div, targetPxWidth, scrollContainer){
    var resizeTO;
    var resize = function(){
      var scale = document.body.offsetWidth / targetPxWidth;
      ALXUI.styleEl(div, {width: targetPxWidth / scale});
      ALXUI.styleEl(scrollContainer, {height: window.innerHeight / scale});
      App.css.setScaleTransform(div, scale, scale, 'left top');
    };
    window.addEventListener('resize', function(){
      clearTimeout(resizeTO);
      resizeTO = setTimeout(resize, 100);
    });
    resize();
  };

}(App));