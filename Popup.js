window.App = window.App || {};
(function(App){
  var Popup = function(parentNode, dispatcher) {
    if(parentNode){
      this.initialize(parentNode, dispatcher);
    }
  };

  var p = Popup.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.dispatcher = dispatcher;
    this.div = this.createShader(parentNode);
    this.popupDiv = ALXUI.addEl(this.div, 'div', popupStyle);
  };

  p.show = function() {
    ALXUI.show(this.div);
  };

  p.hide = function() {
    ALXUI.hide(this.div);
  };

  p.setSize = function(w, h){
    ALXUI.styleEl(this.popupDiv, {
      width: w,
      height: h,
      marginLeft: -w/2,
      marginTop: -h/2,
    });
  };

  p.addOkay = function(onOkay){
    this.okay = ALXUI.addEl(this.popupDiv, 'div', okayStyle);
    this.okay.textContent = 'Okay';
    App.css.addTouchClickEvent(this.okay, onOkay);
  };

  p.createShader = function(parentNode){
    return ALXUI.addEl(parentNode, 'div', shaderStyle);
  };

  p.setTitle = function(title) {
    if(!this.title) {
      this.title = ALXUI.createEl('div', titleStyle);
      this.popupDiv.appendChild(this.title, this.popupDiv.childNodes[0]);
    }
    this.title.textContent = title;
  };

  p.addCloser = function(){
    this.closer = ALXUI.addEl(this.popupDiv, 'div', closerStyle);
    this.closer.textContent = 'X';
    this.closer.addEventListener('click', function(e){
      e.stopPropagation();
      this.hide();
    }.bind(this));
  };

  p.setClickOffHides = function(){
    this.div.addEventListener('click', function(e) {
      if(e.target === self.div){
        this.hide();
      }
    }.bind(this));
  };

  var titleStyle = {
    textAlign: 'center',
    fontFamily: 'arial',
    fontSize: '24px',
    fontWeight: 700,
    margin: 5,
  };

  var shaderStyle = {
    position: 'fixed',
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

  var closerStyle = {
    cssFloat: 'right',
    top: 0,
    right: 0,
    height: 20,
    width: 20,
    lineHeight: 20,
    fontSize: 16,
    backgroundColor: '#999',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'helvetica',
    cursor: 'pointer',
  };

  var okayStyle = {
    backgroundColor: '#999',
    width: 150,
    height: 30,
    color: 'white',
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 20,
    cursor: 'pointer',
    position: 'absolute',
    bottom: 15,
    left: '50%',
    marginLeft: -75,
  };

  App.Popup = Popup;
}(App));/**
 * Created by Alex on 11/8/13.
 */
