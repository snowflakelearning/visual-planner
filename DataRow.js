/**
 * Created by Alex on 11/11/13.
 */
window.App = window.App || {};
(function(App){
  var DataRow = function(parentNode, dispatcher, data) {
    if(parentNode){
      this.initialize(parentNode, dispatcher, data);
    }
  };

  var p = DataRow.prototype;
  p.initialize = function(parentNode, dispatcher, data) {
    this.div = ALXUI.addEl(parentNode, 'div');
    this.dispatcher = dispatcher;
    this.data = data;
};

  p.update = function(data){
    this.data = data;
  };

  p.stripe = function(num){
    if(num % 2 === 0){
      ALXUI.styleEl(this.div, evenStyle);
    } else {
      ALXUI.styleEl(this.div, oddStyle);
    }
  };

  p.addCloser = function(){
    this.closer = ALXUI.addEl(this.div, 'div', closerStyle);
    this.closer.textContent = 'X';
    this.closer.addEventListener('click', function(e){
      e.stopPropagation();
      this.dispatcher.trigger('delete', this);
    }.bind(this));
  };

  var oddStyle = {
    backgroundColor: '#f0f0ff',
  };

  var evenStyle = {
    backgroundColor: '#ffffff',
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

  App.DataRow = DataRow;
}(App));