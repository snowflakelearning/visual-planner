/**
 * Created by Alex on 11/8/13.
 */
window.App = window.App || {};
(function(App){

  var BLANK_IMG = 'images/plus.svg';
  var PLUS_TEXT = 'Click the plus button to add a new image';

  var GalleryThumb = function(parentNode, dispatcher, data) {
    this.initialize(parentNode, dispatcher, data);
  };

  var p = GalleryThumb.prototype = new App.DataRow();

  p.dataRowInitialize = p.initialize;
  p.initialize = function(parentNode, dispatcher, data) {
    this.dataRowInitialize(parentNode, dispatcher, data, mainStyle);
    this.addCloser(null, null, function(){});

    //FOR NOW DELETING IMAGES ISN'T SUPPORTED
    ALXUI.hide(this.closer);

    this.thumb = this.addDiv(thumbStyle);
    this.captionDiv = this.addDiv(captionStyle, null, _onEditClick.bind(this));
    this.editBanner = this.addDiv(editBannerStyle, 'Click to edit', _onEditClick.bind(this));
    App.css.addTouchClickEvent(this.div, _onClick.bind(this));
  };

  p.dataRowUpdate = p.update
  p.update = function(imageData){
    this.dataRowUpdate(imageData);
    ALXUI.setBackgroundImage(this.thumb, imageData.url);
    ALXUI.styleEl(this.thumb, thumbStyle);
    this.captionDiv.textContent = imageData.text || 'No name';
  };

  p.select = function(selected){
    if(selected){
      ALXUI.styleEl(this.div, selectStyle);
    } else {
      ALXUI.styleEl(this.div, mainStyle);
    }
  }

  p.goBlank = function() {
    this.update({url: BLANK_IMG, text: PLUS_TEXT});
    ALXUI.styleEl(this.captionDiv, {bottom: 20});
    ALXUI.styleEl(this.thumb, blankStyle);
    this.input = ALXUI.addEl(this.thumb, 'input', inputStyle);
    App.css.addTouchClickEvent(this.input, function(e){
      this.input.value = '';
    }.bind(this));
    this.input.addEventListener('change', _upload.bind(this));
    this.input.type = 'file';
    this.input.setAttribute('accept', 'image/gif image/jpeg image/png');
    this.thumb.addEventListener('mouseover', function(e){
      ALXUI.styleEl(this, highlightStyle);
    });
    this.thumb.addEventListener('mouseout', function(e){
      ALXUI.styleEl(this, {backgroundColor: 'transparent', boxShadow: 'none'});
    });
    ALXUI.hide(this.closer);
    this.div.removeChild(this.editBanner);
    this.blank = true;
    ALXUI.styleEl(this.div, {cursor: 'default', backgroundColor: 'white'});
  };

  function _onEditClick(e){
    e.stopPropagation();
    if(!this.blank){
      this.dispatcher.trigger('imageEdit', this);
    }
  }

  function _onClick(e){
    if(!this.blank){
      this.dispatcher.trigger('imageClick', this);
    }
  }

  function _upload(evt){
    this.dispatcher.trigger('upload', this, evt.target.files);
  }

  var mainStyle = {
    display: 'inline-block',
    width: 200,
    height: 245,
    margin: 20,
    boxShadow: 'rgba(50, 50, 50, 0.5) 0px 0px 40px',
    backgroundColor: '#ffffff',
    border: 0,
    position: 'relative',
  };

  var inputStyle = {
    width: 100,
    height: 100,
    fontSize: 999,
    outline: 0,
    border: 0,
    opacity: 0,
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'block',
    position: 'absolute',
  };

  var highlightStyle = {
    backgroundColor: '#efefef',
    boxShadow: 'rgba(50, 50, 50, 0.5) 0px 0px 3px'
  };

  var thumbStyle = {
    width: 160,
    height: 140,
    margin: 20,
    backgroundColor: 'transparent',
  };

  var selectStyle = {
    border: 'solid 5px ' + App.DARK_BLUE,
    margin: 15,
  };

  var editBannerStyle = {
    height: 20,
    width: 200,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 16,
    cursor: 'pointer'
  };

  var blankStyle = {
    width: 100,
    height: 100,
    margin: 50,
    marginTop: 35,
    marginBottom: 35,
    cursor: 'pointer'
  };

  var captionStyle = {
    textAlign: 'center',
    width: 190,
    height: 30,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#f6f6ff',
    position: 'absolute',
    cursor: 'pointer',
    bottom: 5,
  };

  App.GalleryThumb = GalleryThumb;
}(App));