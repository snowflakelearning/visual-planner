/**
 * Created by Alex on 11/19/13.
 */
window.App = window.App || {};
(function(App){

  var WhoThumb = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = WhoThumb.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.dispatcher = dispatcher;
    this.div = ALXUI.addEl(parentNode, 'div', mainStyle);
    this.thumb = ALXUI.addEl(this.div, 'div', thumbStyle);
    this.whoText = ALXUI.addEl(this.div, 'div', textStyle);
  };

  p.setAppearance = function(img, text){
    ALXUI.setBackgroundImage(this.thumb, img);
    this.whoText.textContent = text;
  };

  var mainStyle = {
    height: 100,
    width: 100,
    border: 'solid 1px #888',
    boxShadow: 'rgba(50, 50, 50, 0.5) 0px 0px 10px',
    display: 'inline-block',
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
  };

  var thumbStyle = {
    width: 96,
    height: 76,
    margin: 2,
  };

  var textStyle = {
    width: 100,
    height: 19,
    fontSize: 12,
    lineHeight: 19,
    backgroundColor: '#f0f0f0',
  };

  App.WhoThumb = WhoThumb;
}(App));