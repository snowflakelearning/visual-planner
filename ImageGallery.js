/**
 * Created by Alex on 11/8/13.
 */
window.App = window.App || {};
(function(App){

  var s3Prefix = 'https://s3.amazonaws.com/snowflakelearning.com/';
  var MAX_IM_SIZE = 256;

  var ImageGallery = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = ImageGallery.prototype = new App.DataList();
  p.dataListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.dataListInitialize(parentNode, dispatcher);
    ALXUI.styleEl(this.header, headerStyle);
    this.style(mainStyle);
    ALXUI.styleEl(this.listContainer, containerStyle);
    ALXUI.addTouchScrolling(this.listContainer, this.div);
    this.header.textContent = 'Image Gallery';
    this.dispatcher.bind('upload', _handleUpload.bind(this));
    this.dispatcher.bind('delete', _handleDelete.bind(this));
    this.dispatcher.bind('imageEdit', _handleEdit.bind(this));
    this.dispatcher.bind('imageUpdate', _handleImageUpdate.bind(this));
    this.dispatcher.bind('imageClick', _handleImageClick.bind(this));
    this.dispatcher.bind('imageDataLoad', this.update, this);
    this.imageEditPopup = new App.ImageEditPopup(document.body, this.dispatcher);
    _addBlank.apply(this);
  };

  p.toPopupMode = function(){
    p.hide = App.Popup.prototype.hide;
    this.shader = App.Popup.prototype.createShader.call(this, this.div.parentNode);
    App.Popup.prototype.setClickOffHides.call(this)
    this.div.parentNode.appendChild(this.shader);
    this.shader.appendChild(this.div);
    this.style(popupStyle);
    App.Popup.prototype.addOkay.call(this, _onMultiSelect.bind(this));
    ALXUI.styleEl(this.imageEditPopup.shader, {backgroundColor:'transparent'});
    document.body.appendChild(this.imageEditPopup.shader);
  };

  p.popupShow = App.Popup.prototype.show;
  p.show = function(evt, onSelect, multiSelect, currentVals, title){
    this.popupShow();
    this.multiSelect = multiSelect;
    this.onSelect = onSelect;
    this.selected = currentVals;
    _selectThumbs.apply(this, [currentVals]);
    this.header.textContent = title;
    if(multiSelect){
      ALXUI.styleEl(this.listContainer, {bottom: 60});
      ALXUI.show(this.okay);
    } else {
      ALXUI.styleEl(this.listContainer, {bottom: 0});
      ALXUI.hide(this.okay);
    }
  };

  p.dataListAddRow = p.addRow;
  p.addRow = function(rowData){
    var row = this.dataListAddRow(rowData);
    if(this.listContainer.childNodes[1]){
      this.listContainer.insertBefore(row.div, this.listContainer.childNodes[1]);
    } else {
      this.listContainer.appendChild(row.div);
    }
    return row;
  };

  p.createRow = function(data){
    var thumb = new App.GalleryThumb(this.listContainer, this.dispatcher, data);
    return thumb;
  };

  p.dataListUpdate = p.update;
  p.update = function(imData){
    this.dataListUpdate(imData, 'url');
  };

  function _onMultiSelect(){
    this.onSelect(this.selected);
    this.hide();
  }

  function _selectThumbs(data){
    _.each(this.dataRows, function(t){
      t.select(data.indexOf(t.data.url) !== -1)
    });
  }

  function _handleImageClick(thumb){
    if(!this.multiSelect){
      this.hide();
      this.onSelect(thumb.data.url);
    } else {
      var thumbIndex = this.selected.indexOf(thumb.data.url);
      if(thumbIndex !== -1){
        this.selected.splice(thumbIndex, 1);
        thumb.select(false);
      } else {
        this.selected.push(thumb.data.url);
        thumb.select(true);
      }
    }
  }

  function _addBlank(){
    var thumb = this.createRow();
    thumb.goBlank();
    this.listContainer.insertBefore(thumb.div, this.listContainer.childNodes[0]);
  }

  function _handleEdit(box){
    this.imageEditPopup.show(box);
  }

  function _handleImageUpdate(box, data){
    box.update(data);
    this.imageEditPopup.hide();
    this.dispatcher.trigger('updateImageText', data);
    mixpanel.track('imageNameSet');
  }

  function _handleDelete(box){
    ALXUI.hide(box.div);
    this.dispatcher.trigger('deleteImage', box.data);
    mixpanel.track('imageDeleted');
  }

  function _handleUpload(box, fileData){
    var objKey = 'user-images/' + App.getUserID() + '/' + (new Date).getTime();
    var fr = new FileReader();
    fr.onload = function(evt){
      _shrinkAndUpload.apply(this, [evt.target.result, objKey]);
      var thumb = this.addRow({url: evt.target.result});
      this.dispatcher.trigger('imageEdit', thumb);
      thumb.data.url = s3Prefix + objKey;
      mixpanel.track('imageUpload');
    }.bind(this);

    for(var i = 0; i < fileData.length; i++){
      fr.readAsDataURL(fileData[i]);
    }
  }

  function _shrinkAndUpload(uri, objKey){
    var canv = ALXUI.createEl('canvas');
    var im = ALXUI.createEl('img');
    im.addEventListener('load', function(){
      var ar = im.width / im.height;
      if(ar > 1){
        canv.width = Math.min(MAX_IM_SIZE, im.width);
        canv.height = im.height * canv.width / im.width;
      } else {
        canv.height = Math.min(MAX_IM_SIZE, im.height);
        canv.width = im.width * canv.height / im.height;
      }
      canv.getContext('2d').drawImage(im, 0, 0, canv.width, canv.height);
      var type = uri.split('data:')[1].split(';')[0]
      ALXUI.canvasToBlob(canv, function(fileData, type){
        this.dispatcher.trigger('newImageUpload', fileData, type, objKey, {url: s3Prefix + objKey, lastModified: Date.now()});
      }.bind(this), type);

    }.bind(this))
    im.src = uri;
  }

  function _err(err){
    console.log(err);
  }

  var mainStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center'
  };

  var containerStyle = {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    overflowY: 'auto',
    overflowX: 'hidden',  //IE11 likes thise for some reason
  };

  var popupStyle = {
    position: 'fixed',
    left: '10%',
    right: '10%',
    top: '10%',
    bottom: '10%',
    backgroundColor: '#fafafa',
    color: '#07163d',
    boxShadow: 'rgba(61, 46, 7, 0.74902) 0px 0px 20px 0px'
  };

  var headerStyle = {
    width: '90%',
    height: 70,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginLeft: '5%',
    marginRight: '5%',
  };

  App.ImageGallery = ImageGallery;
}(App));