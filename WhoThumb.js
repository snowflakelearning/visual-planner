/**
 * Created by Alex on 11/19/13.
 */
window.App = window.App || {};
(function(App){

  var WhoThumb = function(parentNode, dispatcher, data) {
    this.initialize(parentNode, dispatcher, data);
  };

  var p = WhoThumb.prototype = new App.DataRow();
  p.dataRowInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher, data) {
    this.dataRowInitialize(parentNode, dispatcher, data, mainStyle);
    this.thumb = this.addDiv(thumbStyle);
    this.whoText = this.addDiv(textStyle);
  };

  p.dataRowUpdate = p.update;
  p.update = function(data){
    ALXUI.setBackgroundImage(this.thumb, data.dataURI || data.url);
    this.whoText.textContent = data.text || 'No Name';
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
    fontSize: 11,
    lineHeight: 19,
    backgroundColor: '#f0f0f0',
  };

  App.WhoThumb = WhoThumb;
}(App));