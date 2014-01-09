/**
 * Created by Alex on 1/2/14.
 */
window.App = window.App || {};
(function(App){
  var LabeledCheckbox = function(parentNode, label, tooltip, onInput, onInputClick) {
    this.initialize(parentNode, label, tooltip, onInput, onInputClick);
  };

  var p = LabeledCheckbox.prototype = new App.LabeledInput();
  p.labeledInputInitialize = p.initialize;

  p.initialize = function(parentNode, label, tooltip, onInput, onInputClick) {
    this.labeledInputInitialize(parentNode, label, tooltip, onInput, onInputClick);
    this.input.type = "checkbox";
    this.input.removeEventListener('input', onInput);
    this.input.addEventListener('change', onInput);
    ALXUI.styleEl(this.label, labelStyle);
    ALXUI.styleEl(this.input, inputStyle);
  };

  var inputStyle = {
    width: 24,
    height: 24,
    cssFloat: 'right',
    margin: 0,
    marginRight: 10,
  }

  var labelStyle = {
    cssFloat: 'right',
    fontFamily: 'Arial',
    width: 150,
    fontSize: 12,
    marginRight: -13,
    lineHeight: 14,
  };

  App.LabeledCheckbox = LabeledCheckbox;
}(App));
