/**
 * Created by Alex on 12/10/13.
 */
window.App = window.App || {};
(function(App){
  var VPBase = function(parentNode, dispatcher, mainStyle) {
    if(parentNode){
      this.initialize(parentNode, dispatcher, mainStyle);
    }
  };

  var p = VPBase.prototype = new App.UIBase();
  p.uIBaseInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher, mainStyle) {
    this.uIBaseInitialize(parentNode, dispatcher, [mainStyle, vpGlobalStyle]);
  };

  var vpGlobalStyle = {
    fontFamily: 'Oxygen',
  };

  p.addCloser = function(parentNode, style, onClose){
    this.closer = this.addDiv(closerStyle);
    this.closer.textContent = 'X';
    App.css.addTouchClickEvent(this.closer, onClose);
    if(parentNode){
      parentNode.appendChild(this.closer);
    }
    if(style){
      ALXUI.styleEl(this.closer, style);
    }
    return this.closer;
  };

  var closerStyle = {
    cssFloat: 'right',
    height: 30,
    width: 30,
    lineHeight: 30,
    fontSize: 22,
    backgroundColor: '#999',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'helvetica',
    cursor: 'pointer',
  };

  App.VPBase = VPBase;
}(App));
