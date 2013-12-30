/**
 * Created by Alex on 11/25/13.
 */
window.App = window.App || {};
(function(App){

  var margin = 10;

  var IntroPopup = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = IntroPopup.prototype = new App.Popup();
  p.popupInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.popupInitialize(parentNode, dispatcher, mainStyle);
    parentNode.removeChild(this.shader);
    parentNode.appendChild(this.div);
    this.text = this.addDiv(textStyle);
    this.next = this.addDiv(nextStyle, null, _onNextClick.bind(this));
    App.css.addTouchClickEvent(this.div, function(e){
      e.stopPropagation();
    });
  };

  p.setPos = function(el, posType, offset) {
    this.show();
    var shift = offset || {x: 0, y: 0};
    var split = posType.split(',');
    var elRect = el.getBoundingClientRect();
    var point = {x: elRect[split[0]] || elRect['left'], y: elRect[split[1]] || elRect['right']};
    var posStyle = {margin: 0, left: null, right: null, top: null, bottom: null};
    if(split[1] === 'bottom'){
      shift.y += margin;
    } else {
      shift.y -= this.div.offsetHeight + margin;
    }
    if(split[0] === 'right'){
      shift.x += margin;
    } else if(split[0] === 'left'){
      shift.x -= this.div.offsetWidth + margin;
    } else if(split[0] === 'center'){
      shift.x += el.offsetWidth / 2;
      shift.x -= this.div.offsetWidth / 2;
    }
    posStyle.left = Math.max(0, Math.min(point.x + shift.x, window.innerWidth - this.div.offsetWidth));
    posStyle.top = Math.max(0, Math.min(point.y + shift.y, window.innerHeight - this.div.offsetHeight));
    this.style(posStyle);
  };

  p.setText = function(text, last){
    this.text.innerHTML = text;
    if(last){
      this.next.textContent = 'Done';
    } else {
      this.next.textContent = 'Next';
    }
  };

  p.center = function(){
    this.style({left: '50%', top: '50%',
      marginLeft: -this.div.offsetWidth / 2, marginTop: -this.div.offsetHeight / 2});
  };

  p.setButtonVis = function(vis){
    if(vis){
      ALXUI.show(this.next);
      ALXUI.styleEl(this.text, {marginBottom: 75});
    } else {
      ALXUI.hide(this.next);
      ALXUI.styleEl(this.text, {marginBottom: 20});
    }
  }

  function _onNextClick(){
    this.dispatcher.trigger('nextIntroStep');
  }

  var mainStyle = {
    margin: null,
    border: '5px solid ' + App.DARK_BLUE,
    backgroundColor: 'white',
    width: 350,
    fontFamily: App.MAIN_FONT,
  };

  var textStyle = {
    width: 310,
    margin: 20,
    fontSize: 18,
    color: '#666',
    marginBottom: 75
  };

  var nextStyle = {
    position: 'absolute',
    width: 120,
    bottom: 20,
    left: '50%',
    height: 35,
    marginLeft: -60,
    backgroundColor: App.DARK_BLUE,
    textAlign: 'center',
    fontSize: 22,
    color: 'white',
    lineHeight: 35,
    cursor: 'pointer',
    borderRadius: 3,
  };

  App.IntroPopup = IntroPopup;
}(App));
