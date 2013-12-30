/**
 * Created by Alex on 12/11/13.
 */
window.App = window.App || {};
(function(App){

  var ImageDataMapper = function(dispatcher) {
    this.initialize(dispatcher);
  };

  var p = ImageDataMapper.prototype;
  p.initialize = function(dispatcher) {
    this.dispatcher = dispatcher;
    this.map = {};
    this.dispatcher.bind('imageDataChange', _onImageDataChange, this);
  };

  p.getImageData = function(url){
    if(this.map[url]){
      return this.map[url];
    } else {
      return {url: url, text: "", dataURI: null};
    }
  };

  p.processImages = function(imDataArr, callback){
    var oncomplete = function(arg){
      if(callback){
        callback(arg);
      }
    }
    if(!imDataArr || imDataArr.length === 0){
      oncomplete(imDataArr);
      return;
    }
    var numLoaded = 0;
    var numToLoad = imDataArr.length;
    var im;

    for(var i = 0; i < imDataArr.length; i++){
      if(imDataArr[i].dataURI){
        this.map[imDataArr[i].url] = {url: imDataArr[i].url,
          dataURI: imDataArr[i].dataURI, lastModified: imDataArr[i].lastModified};
        numLoaded++;
      } else if(this.map[imDataArr[i].url] &&  (imDataArr[i].lastModified <=
          this.map[imDataArr[i].url].lastModified || !this.map[imDataArr[i].url].lastModified)){
        numLoaded++;
      } else {
        im = ALXUI.createEl('img');
        im.crossOrigin = "Anonymous";
        im.addEventListener('load', _createImageLoad.apply(this, [imDataArr[i], im]));
        im.src = imDataArr[i].url.replace('https://s3.amazonaws.com/snowflakelearning.com',
            'http://snowflakelearning.com');
      }
      if(numLoaded === numToLoad){
        oncomplete(imDataArr);
        return;
      }
    }

    function _createImageLoad(imData, im){
      return function(){
        var canvas = ALXUI.createEl('canvas');
        canvas.width = im.width;
        canvas.height = im.height;
        canvas.getContext('2d').drawImage(im, 0, 0, canvas.width, canvas.height);
        console.log('TO DATA URL');
        this.map[imData.url] = {url: imData.url, dataURI: canvas.toDataURL(),
            lastModified: imData.lastModified};
        numLoaded++;
        if(numLoaded === numToLoad){
          oncomplete(imDataArr);
        } else if(numLoaded > numToLoad){
          console.log('THE BUG!!!!!!!!!!!!!!');
        }
      }.bind(this);
    };
  };

  p.updateMapItem = function(url, data){
    if(this.map[url]){
      for(var x in data){
        url[x] = data[x];
      }
    }
  };

  function _onImageDataChange(model){
    var data = model.getImageData();
    _.each(data, function(i){
      if(!i.lastModified){
        i.lastModified = Date.now();
      }
    });
    this.processImages(data);
  }

  App.ImageDataMapper = ImageDataMapper;
}(App));
