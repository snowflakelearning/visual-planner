window.App = window.App || {};
(function(App){
  var Popup = function(parentNode, dispatcher, style) {
    if(parentNode){
      this.initialize(parentNode, dispatcher, style);
    }
  };

  var p = Popup.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  var p = Popup.prototype;
  p.initialize = function(parentNode, dispatcher, style) {
    this.shader = this.createShader(parentNode);
    this.baseInitialize(this.shader, dispatcher, [popupStyle, style || {}]);
  };

  p.show = function() {
    ALXUI.show(this.shader);
  };

  p.hide = function() {
    ALXUI.hide(this.shader);
  };

  p.setSize = function(w, h){
    this.style({
      width: w,
      height: h,
      marginLeft: -w/2,
      marginTop: -h/2,
    });
  };

  p.addOkay = function(onOkay, side){
    if(this.okay){
      this.div.removeChild(this.okay);
    }
    this.okay = this.addDiv(okayStyle, 'Okay', onOkay);
    if(side){
      _moveButtonToSide.apply(this, [this.okay, side]);
    }
  };

  p.addCancel = function(side){
    if(this.cancel){
      this.div.removeChild(this.cancel);
    }
    this.cancel = this.addDiv(okayStyle, 'Cancel', this.hide.bind(this));
    if(side){
      _moveButtonToSide.apply(this, [this.cancel, side]);
    }
  };

  p.createShader = function(parentNode){
    return ALXUI.addEl(parentNode, 'div', shaderStyle);
  };

  p.setTitle = function(title) {
    if(!this.title) {
      this.title = this.addDiv(titleStyle);
    }
    this.title.textContent = title;
  };

  p.setClickOffHides = function(){
    App.css.addTouchClickEvent(this.shader, function(e) {
      if(e.target === this.shader){
        this.hide();
      }
    }.bind(this));
  };

  function _moveButtonToSide(button, side){
    if(side === "left"){
      ALXUI.styleEl(button, {left: 15, right: null, margin: 0});
    } else if(side === "right"){
      ALXUI.styleEl(button, {right: 15, left: null, margin: 0});
    }
  }

  var titleStyle = {
    textAlign: 'center',
    fontFamily: 'arial',
    fontSize: '24px',
    fontWeight: 700,
    margin: 10,
  };

  var shaderStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 99999999999999,
    display: 'none',
  };

  var popupStyle = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    width: '300',
    height: '130',
    backgroundColor: '#fafafa',
    color: '#07163d',
    marginLeft: '-150',
    marginTop: '-65',
    boxShadow: 'rgba(61, 46, 7, 0.74902) 0px 0px 20px 0px'
  };

  var okayStyle = {
    position: 'absolute',
    width: 120,
    bottom: 15,
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

  App.Popup = Popup;
}(App));/**
 * Created by Alex on 11/8/13.
 */
