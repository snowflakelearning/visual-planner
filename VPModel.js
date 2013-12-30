/**
 * Created by alex on 12/14/13.
 */
window.App = window.App || {};
(function(App){

  App.getImageData = function(url){
    if(this.vpmodel){
      //object data is faster as we don't stringify and unstringify
      var imData = this.vpmodel.model.get('objectImageData');
      var im = _.find(imData, function(i){
        return i.url === url;
      });
      if(im){
        im.dataURI = App.getImageDataURI(im.url)
        return im;
      }
    }

    return {url: url, text: "", dataURI: null};
  }

  var VPModel = function(dispatcher) {
    this.initialize(dispatcher);
  };

  var p = VPModel.prototype;
  p.initialize = function(dispatcher) {
    this.dispatcher = dispatcher;
    var model = Backbone.Model.extend({});
    this.model = new model();
    App.vpmodel = this;
    this.dispatcher.bind('activityJsonLoad', this.setActivityData, this);
    this.dispatcher.bind('userDataLoad', this.setUserData, this);
    this.dispatcher.bind('imageDataLoad', this.setImageData, this);
    this.dispatcher.bind('updateImageText', _updateImageText, this);
    this.dispatcher.bind('newImageUpload', _addNewImage, this);

    this.dispatcher.bind('backToHome', function(){ this.editing = false;}, this);
    this.dispatcher.bind('showEditor', function(){ this.editing = true;}, this);
  };

  p.setActivityData = function(data, silent, fromServer){
    if(fromServer && this.editing){
      return;
    }
    var dataString = JSON.stringify(data);
    if(dataString !== this.model.get('activityData') || !this.initialized){
      this.model.set('activityData', dataString);
      if(!silent){
        this.initialized = this.initialized || fromServer || !window.navigator.onLine;
        if(this.initialized){
          _triggerChunked.apply(this, [['modelChange', 'activityDataChange']]);
        }
      }
    }
  };

  p.getActivityData = function(){
    return JSON.parse(this.model.get('activityData') || '[]');
  };

  p.setUserData = function(data, silent){
    var dataString = JSON.stringify(data);
    if(dataString !== this.model.get('userData')){
      this.model.set('userData', dataString);
      if(!silent){
        _triggerChunked.apply(this, [['userDataChange']]);
      }
    }
  };

  p.getUserData = function(){
    return JSON.parse(this.model.get('userData'));
  };

  p.setImageData = function(data, silent){
    var dataString = JSON.stringify(data);
    if(dataString !== this.model.get('imageData')){
      this.model.set('objectImageData', data);
      this.model.set('imageData', dataString);
      if(!silent){
        _triggerChunked.apply(this, [['modelChange', 'imageDataChange']]);
      }
    }
    var ud = this.getUserData();
    if(ud && ud.Item && ud.Item.imageData){
      ud.Item.imageData.S = dataString;
      this.setUserData(ud, silent);
    }
  };

  p.getImageData = function(){
    return JSON.parse(this.model.get('imageData') || '[]');
  };

  function _updateImageText(data){
    var imData = this.getImageData();
    var toChange = _.find(imData, function(i){
      return i.url === data.url;
    });
    toChange.text = data.text;
    this.setImageData(imData);
    this.dispatcher.trigger('pushImageData', this.getImageData());
  }

  function _addNewImage(fileData, fileType, objKey, objData){
    var imData = this.getImageData();
    imData.push(objData);
    this.setImageData(imData);
    this.dispatcher.trigger('pushImageData', this.getImageData());
  }

  function _triggerChunked(evts){
    for(var i = 0; i < evts.length; i++){
      clearTimeout(this[evts[i] + 'TO']);
      this[evts[i] + 'TO'] = setTimeout(_createTriggerFunc.apply(this, [evts[i]]), 200);
    }
  }

  function _createTriggerFunc(evtName){
    return function(){
      this.dispatcher.trigger(evtName, this);;
    }.bind(this);
  }

  App.VPModel = VPModel;
}(App));
