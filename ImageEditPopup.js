/**
 * Created by Alex on 11/11/13.
 */
window.App = window.App || {};
(function(App){

  var instructionText = 'Enter a name for this image, for example, "Mom", "School" or "Teddy"';

  var ImageEditPopup = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = ImageEditPopup.prototype = new App.Popup();
  p.popupInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.popupInitialize(parentNode, dispatcher);
    ALXUI.styleEl(this.popupDiv, sizeStyle);
    this.addCloser();
    this.setTitle('Name this image');
    this.thumb = ALXUI.addEl(this.popupDiv, 'div', thumbStyle);
    this.textInput = ALXUI.addEl(this.popupDiv, 'textarea', taStyle);
    this.addOkay(_onOkay.bind(this));
  };

  p.popupShow = p.show;
  p.show = function(box){
    this.popupShow();
    ALXUI.setBackgroundImage(this.thumb, box.data.url);
    this.data = box.data;
    this.editing = box;
    this.textInput.value = box.data.text;
    if(!box.data.text){
      this.textInput.value = instructionText;
      ALXUI.styleEl(this.textInput, {color: '#aaa'});
      this.textInput.addEventListener('click', function once(e){
        this.textInput.removeEventListener('click', once);
        this.textInput.value = '';
        ALXUI.styleEl(this.textInput, {color: 'black'});
      }.bind(this));
    } else {
      this.textInput.focus();
      this.textInput.select();
    }
  };

  function _onOkay(e){
    if(!this.textInput.value || this.textInput.value === instructionText){
      alert('Please enter a name.');
      return;
    }
    this.data.text = this.textInput.value;
    this.dispatcher.trigger('imageUpdate', this.editing, this.data);
  }

  var sizeStyle = {
    width: 300,
    height: 360,
    marginLeft: -150,
    marginTop: -180,
    fontFamily: 'Helvetica',
  };

  var thumbStyle = {
    width: 260,
    height: 160,
    margin: 20,
    backgroundColor: 'transparent'
  };

  var taStyle = {
    marginLeft: 20,
    width: 250,
    height: 60,
  };

  App.ImageEditPopup = ImageEditPopup;
}(App));