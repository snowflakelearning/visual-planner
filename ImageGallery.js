/**
 * Created by Alex on 11/8/13.
 */
window.App = window.App || {};
(function(App){

  var s3Prefix = 'https://s3.amazonaws.com/VPTestApp/';
  var MAX_IM_SIZE = 400;

  var ImageGallery = function(parentNode, dispatcher, accountManager) {
    this.initialize(parentNode, dispatcher, accountManager);
  };

  var p = ImageGallery.prototype = new App.DataList();
  p.dataListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher, accountManager) {
    this.dataListInitialize(parentNode, dispatcher);
    this.accountManager = accountManager;
    ALXUI.styleEl(this.div, mainStyle);
    ALXUI.styleEl(this.listContainer, containerStyle);
    this.header.textContent = 'Image Gallery';
    this.dispatcher.bind('upload', _handleUpload.bind(this));
    this.dispatcher.bind('delete', _handleDelete.bind(this));
    this.dispatcher.bind('imageEdit', _handleEdit.bind(this));
    this.dispatcher.bind('imageUpdate', _handleImageUpdate.bind(this));
    this.dispatcher.bind('imageClick', _handleImageClick.bind(this));
    this.accountManager.addUpdateListener(this.update.bind(this));
    this.imageEditPopup = new App.ImageEditPopup(document.body, this.dispatcher);
    _addBlank.apply(this);
  };

  p.toPopupMode = function(){
    p.hide = App.Popup.prototype.hide;
    this.popupDiv = this.div;
    this.div = App.Popup.prototype.createShader.call(this, this.popupDiv.parentNode);
    this.popupDiv.parentNode.appendChild(this.div);
    this.div.appendChild(this.popupDiv);
    App.Popup.prototype.addCloser.call(this);
    this.popupDiv.insertBefore(this.closer, this.header);
    ALXUI.styleEl(this.popupDiv, popupStyle);
    this.popupMode = true;
    App.Popup.prototype.addOkay.call(this, _onMultiSelect.bind(this));
    ALXUI.styleEl(this.imageEditPopup.div, {backgroundColor:'transparent'});
    document.body.appendChild(this.imageEditPopup.div);
  };

  p.popupShow = App.Popup.prototype.show;
  p.show = function(evt, onSelect, multiSelect, currentVals){
    this.popupShow();
    this.multiSelect = multiSelect;
    this.onSelect = onSelect;
    this.selected = currentVals;
    _selectThumbs.apply(this, [currentVals]);
    if(multiSelect){
      this.header.textContent = 'Select Images';
      ALXUI.styleEl(this.listContainer, {bottom: 60});
      ALXUI.show(this.okay);
    } else {
      this.header.textContent = 'Select An Image';
      ALXUI.styleEl(this.listContainer, {bottom: 0});
      ALXUI.hide(this.okay);
    }
  };

  p.createRow = function(data){
    var thumb = new App.GalleryThumb(this.listContainer, this.dispatcher);
    if(data){
      thumb.setAppearance(data);
    }
    return thumb;
  };

  p.dataListUpdate = p.update;
  p.update = function(userData){
    this.dataListUpdate(userData.imageData, 'url');
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
    box.setAppearance(data);
    this.imageEditPopup.hide();
    this.accountManager.updateImageText(data);
    mixpanel.track('imageNameSet');
  }

  function _handleDelete(box){
    ALXUI.hide(box.div);
    this.accountManager.deleteImage(box.data);
    mixpanel.track('imageDeleted');
  }

  function _handleUpload(box, fileData){
    var objKey = 'user-images/' + this.accountManager.userID + '/' + (new Date).getTime();
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
        this.accountManager.pushImageToS3(fileData, type, objKey, function(){});
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

  App.ImageGallery = ImageGallery;
}(App));