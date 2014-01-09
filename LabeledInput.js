/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  var LabeledInput = function(parentNode, label, tooltip, onInput, onInputClick) {
    if(parentNode){
      this.initialize(parentNode, label, tooltip, onInput, onInputClick);
    }
  };

  var p = LabeledInput.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  p.initialize = function(parentNode, label, tooltip, onInput, onInputClick) {
    this.baseInitialize(parentNode, null, divStyle);
    this.label = this.addDiv(labelStyle, label + ':');
    this.input = ALXUI.addEl(this.div, 'input', inputStyle);
    this.input.title = tooltip;
    if(onInputClick){
      App.css.addTouchClickEvent(this.input, onInputClick);
    }
    if(onInput){
      this.input.addEventListener('input', onInput);
    }
  };

  var divStyle = {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5,
    marginBottom: 5,
    color: '#434343',
    height: 24,
    width: App.css.generateBrowserCalcString('50% - 60px'),
    cssFloat: 'left',

  };

  var labelStyle = {
    height: 24,
    lineHeight: '24px',
    cssFloat: 'left',
    fontFamily: 'Arial',
    width: 60,
  };

  var inputStyle = {
    height: 18,
    cssFloat: 'left',
    marginLeft: 10,
    width: App.css.generateBrowserCalcString('100% - 90px'),
  };

  App.LabeledInput = LabeledInput;
}(App));
