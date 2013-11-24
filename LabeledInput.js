/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  var LabeledInput = function(parentNode, label, tooltip) {
    this.initialize(parentNode, label, tooltip);
  };

  var p = LabeledInput.prototype;
  p.initialize = function(parentNode, label, tooltip) {
    this.div = ALXUI.addEl(parentNode, 'div', divStyle);
    this.label = ALXUI.addEl(this.div, 'div', labelStyle);
    this.label.textContent = label + ':';
    this.input = ALXUI.addEl(this.div, 'input', inputStyle);
    this.input.title = tooltip;
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
    width: 50,
  };

  var inputStyle = {
    height: 24,
    cssFloat: 'left',
    marginLeft: 10,
    width: App.css.generateBrowserCalcString('100% - 120px'),
  };

  App.LabeledInput = LabeledInput;
}(App));
