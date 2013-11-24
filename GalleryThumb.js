/**
 * Created by Alex on 11/8/13.
 */
window.App = window.App || {};
(function(App){

  var BLANK_IMG = 'images/addImage.png';
  var PLUS_TEXT = 'Click the plus button above to add a new image';

  var GalleryThumb = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = GalleryThumb.prototype = new App.DataRow();

  p.dataRowInitialize = p.initialize;
  p.initialize = function(parentNode, dispatcher) {
    this.dataRowInitialize(parentNode, dispatcher);
    ALXUI.styleEl(this.div, mainStyle);
    this.addCloser();

    //FOR NOW DELETING IMAGES ISN'T SUPPORTED
    ALXUI.hide(this.closer);

    this.thumb = ALXUI.addEl(this.div, 'div', thumbStyle);
    this.captionDiv = ALXUI.addEl(this.div, 'div', captionStyle);
    this.thumbClick = null;
    this.editBanner = ALXUI.addEl(this.div, 'div', editBannerStyle);
    this.editBanner.textContent = 'Click to edit';
    this.editBanner.addEventListener('click', _onEditClick.bind(this));
    this.captionDiv.addEventListener('click', _onEditClick.bind(this));
    this.div.addEventListener('click', _onClick.bind(this));
  };

  p.setAppearance = function(imageData){
    ALXUI.setBackgroundImage(this.thumb, imageData.url);
    ALXUI.styleEl(this.thumb, thumbStyle);
    this.captionDiv.textContent = imageData.text || 'No name';
    //TODO deal with touchstart
    this.thumb.removeEventListener('click', this.thumbClick);
    this.update(imageData);
  };

  p.select = function(selected){
    if(selected){
      ALXUI.styleEl(this.div, selectStyle);
    } else {
      ALXUI.styleEl(this.div, mainStyle);
    }
  }

  p.goBlank = function() {
    this.setAppearance({url: BLANK_IMG, text: PLUS_TEXT});
    ALXUI.styleEl(this.thumb, blankStyle);
    this.thumb.addEventListener('click', this.thumbClick);
    this.input = ALXUI.addEl(this.thumb, 'input', inputStyle);
    this.input.addEventListener('click', function(e){
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
    height: 260,
    margin: 20,
    boxShadow: 'rgba(50, 50, 50, 0.5) 0px 0px 40px',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    border: 0,
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
    height: 160,
    margin: 20,
    backgroundColor: 'transparent',
  };

  var selectStyle = {
    border: 'solid 3px #07163d',
    margin: 17,
  };

  var editBannerStyle = {
    height: 20,
    width: 200,
    marginTop: -20,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 16
  };

  var blankStyle = {
    width: 100,
    height: 100,
    margin: 50,
    cursor: 'pointer'
  };

  var captionStyle = {
    textAlign: 'center',
    width: 190,
    height: 40,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#f6f6ff',
    position: 'absolute',
    cursor: 'pointer',
  };

  App.GalleryThumb = GalleryThumb;
}(App));