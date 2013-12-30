/**
 * Created by Alex on 12/10/13.
 */
window.App = window.App || {};
(function(App){

  var UIBase = function(parentNode, dispatcher, mainStyle) {
    if(parentNode){
      this.initialize(parentNode, dispatcher, mainStyle);
    }
  };

  var p = UIBase.prototype;
  p.initialize = function(parentNode, dispatcher, mainStyle) {
    this.parentNode = parentNode;
    this.dispatcher = dispatcher;
    this.div = ALXUI.addEl(parentNode, 'div', mainStyle || {});
  };

  p.hide = function(){
    ALXUI.hide(this.div);
  };

  p.show = function(){
    ALXUI.show(this.div);
  };

  p.style = function(style){
    ALXUI.styleEl(this.div, style);
  };

  p.addDiv = function(style, textContent, ontouchclick, context){
    return ALXUI.addDivTo(this.div, style, textContent, ontouchclick, this || context);
  };

  App.UIBase = UIBase;
}(App));