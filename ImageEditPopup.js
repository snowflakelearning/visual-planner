/**
 * Created by Alex on 11/11/13.
 */
window.App = window.App || {};
(function(App){

  var instructionText = 'Enter a name for this image, eg "Mom"';

  var ImageEditPopup = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = ImageEditPopup.prototype = new App.Popup();
  p.popupInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.popupInitialize(parentNode, dispatcher);
    ALXUI.styleEl(this.popupDiv, sizeStyle);
    this.setTitle('Name this image');
    this.thumb = ALXUI.addEl(this.popupDiv, 'div', thumbStyle);
    this.textInput = ALXUI.addEl(this.popupDiv, 'input', taStyle);
    this.textInput.type = 'text';
    this.addOkay(_onOkay.bind(this));
    this.textInput.addEventListener('keydown', function(e){
      if(e.keyCode === 13){
        _onOkay.apply(this);
      }
    }.bind(this));
  };

  p.popupShow = p.show;
  p.show = function(box){
    this.popupShow();
    ALXUI.setBackgroundImage(this.thumb, box.data.url);
    this.data = box.data;
    this.editing = box;
    this.textInput.value = box.data.text;
    console.log(box.data.text);

    var once = function once(e){
      this.textInput.value = '';
      ALXUI.styleEl(this.textInput, {color: 'black'});
      this.textInput.removeEventListener('touchstart', once);
      this.textInput.removeEventListener('click', once);
      setTimeout(function(){
        this.textInput.focus();
      }.bind(this));
    }

    if(!box.data.text){
      this.textInput.value = instructionText;
      ALXUI.styleEl(this.textInput, {color: '#aaa'});
      if(!App.css.osIsIOS() && !App.css.osIsAndroid()){
        this.textInput.addEventListener('click', once.bind(this));
      } else {
        this.textInput.addEventListener('touchstart', once.bind(this));
      }
    } else {
      this.textInput.focus();
      this.textInput.select();
    }
  };

  function _onOkay(e){
    //HACK TO JIGGLE ON IOS
    if(App.css.osIsIOS()){
      document.body.scrollTop = 1;
      setTimeout(function(){
        document.body.scrollTop = 0;
      }, 30);
    }
    if(!this.textInput.value || this.textInput.value === instructionText){
      alert('Please enter a name.');
      return;
    }
    this.data.text = this.textInput.value;
    this.dispatcher.trigger('imageUpdate', this.editing, this.data);
    this.textInput.blur();
    setTimeout(function(){
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }

  var sizeStyle = {
    width: 300,
    height: 330,
    marginLeft: -150,
    marginTop: -165,
    fontFamily: 'Oxygen',
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
    height: 25,
  };

  App.ImageEditPopup = ImageEditPopup;
}(App));