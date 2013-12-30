/**
 * Created by Alex on 11/11/13.
 */
window.App = window.App || {};
(function(App){
  var DataRow = function(parentNode, dispatcher, data, style) {
    if(parentNode){
      this.initialize(parentNode, dispatcher, data, style);
    }
  };

  var p = DataRow.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  var p = DataRow.prototype;
  p.initialize = function(parentNode, dispatcher, data, style) {
    this.baseInitialize(parentNode, dispatcher, style);
    this.data = data;
};

  p.update = function(data){
    this.data = data;
  };

  p.stripe = function(num){
    if(num % 2 === 0){
      this.style(evenStyle);
    } else {
      this.style(oddStyle);
    }
  };

  var oddStyle = {
    backgroundColor: '#f0f0ff',
  };

  var evenStyle = {
    backgroundColor: '#ffffff',
  };

  App.DataRow = DataRow;
}(App));