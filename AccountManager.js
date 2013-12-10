/**
 * Created by Alex on 11/8/13.
 */
window.App = window.App || {};
(function(){

  //Add a global function for looking up image data based on its URL
  //The account manager updates the map that this function uses every time
  //it gets new server data from getUserImages
  App.getImageData = function(url){
    if(this.imageDataMap && this.imageDataMap[url]){
      return this.imageDataMap[url];
    } else {
      return {url: url, text: "", dataURI: null};
    }
  };

  var appId = App.FB_APP_ID;

  var s3Prefix = 'https://s3.amazonaws.com/snowflakelearning.com/'; //TODO REMOVE

  var AccountManager = function(onLogin, dispatcher){
    this.initialize(onLogin, dispatcher);
  };

  var p = AccountManager.prototype;

  p.initialize = function(onLogin, dispatcher){
    this.dispatcher = dispatcher;
    this.storageManager = new App.StorageManager(this.dispatcher);
    _getDBAndBucket.apply(this);
    window.addEventListener('offline', function(){
      this.online = false;
      _getDBAndBucket.apply(this);
      this.dispatcher.trigger('offline');
    }.bind(this));

    window.addEventListener('online', function(){
      _getDBAndBucket.apply(this);
      this.online = true;
      this.dispatcher.trigger('online');
      if(!this.fbLoggedIn){
        _initFB.apply(this, [true]);
      }
    }.bind(this));

    this.onLogin = onLogin;
    this.userID = null;
    this.userData = null;
    this.updateListeners = [];
    this.fbLoggedIn = false;

    this.addUpdateListener(this.storageManager.storeLocal.bind(this.storageManager));
    this.load();
  };

  p.prepopulateImageMapFromCache = function(complete){
    App.imageDataMap = App.imageDataMap || {};
    this.storageManager.getLocalImageData(function(data){
      for(var i = 0; i < data.length; i++){
        App.imageDataMap[data[i].url] = data[i];
      }
      complete();
    });
  };

  p.load = function(){
    this.online = window.navigator.onLine;
    if(this.online){
      _onlineLoad.apply(this);
    } else {
      _offlineLoad.apply(this);
    }
  };

  p.checkFBLogin = function(){
    setTimeout(function(){
      FB.getLoginStatus(function(resp){
        if(resp.status === 'connected'){
          if(!this.fbLoggedIn){
            _handleFBLogin.apply(this, [resp]);
          }
        } else if(resp.status === 'not_authorized'){
          this.loginPopup.show();
          this.loginPopup.showAuthorizing();
        } else if(resp.status === 'unknown'){
          this.fbLoggedIn = false;
          this.loginPopup.show();
        }
      }.bind(this));
    }.bind(this), 10);
  };

  p.FBLogin = function(){
    FB.login(_handleFBLogin.bind(this), {scope: 'email'});
  };

  p.getUserImages = function(_onComplete, _onError){
    this.db.getItem({TableName: 'Users', "Key": { "id": {"S": this.userID}}}, function(err, data){
      if(err){
        console.log(err.stack);
      } else {
        this.userData = _parseUserItem.apply(this, [data]);
        this.buildImageDataMap(function(){
          _onComplete(this.userData.imageData);
          _callListeners.apply(this);
        }.bind(this));
      }
    }.bind(this));
  };

  p.addUpdateListener = function(func){
    this.updateListeners.push(func);
  };

  p.pushImageToS3 = function(fileData, fileType, objKey){
    if(this.pending){
      this.pending = false;
      setTimeout(function(){ this.pushImageToS3(fileData, fileType, objKey)
      }.bind(this), 2000);
      return;
    }
    _uploadPending.apply(this, [true]);
    this.getUserImages(function(){
      var params = {Key: objKey, ContentType: fileType, Body: fileData, ACL: 'public-read'};
      this.bucket.putObject(params, function (err, data) {
        if (err) {
          console.log(err);
          console.log(err.stack);
          alert('Error uploading image');
        } else {
          this.userData.imageData.push({url: s3Prefix + objKey, lastModified: Date.now()});
          _chunkedUpdateDb.apply(this);
        }
      }.bind(this));
    }.bind(this), function(err, data){
      console.log('PUT ERROR!');
      console.log(err);
    });
  };

  p.updateImageText = function(imData){
    //A full on queuing system would be better
    if(this.pending){
      this.pending = false;
      setTimeout(function(){
        this.updateImageText(imData)
      }.bind(this), 2000);
      return;
    }
    _uploadPending.apply(this, [true]);
    this.getUserImages(function(){
      var toChange = _.find(this.userData.imageData, function(im){
        return im.url === imData.url;
      });
      imData.lastModified = Date.now();
      if(toChange){
        for(var x in imData){
          toChange[x] = imData[x];
          if(App.imageDataMap[imData.url]){
            App.imageDataMap[imData.url][x] = imData[x];
          }
        }
      }
      _chunkedUpdateDb.apply(this);
    }.bind(this));
  };

  p.deleteImage = function(imData){
    this.userData.imageData = _.reject(this.userData.imageData, function(row){
      return row.url === imData.url;
    });
    _chunkedUpdateDb.apply(this);
    this.bucket.deleteObject({Key: imData.url.split('VPTestApp/')[1]}, function(err, data){
      if(err){
        console.log(err);
      }
    });
  };

  p.pushActivityData = function(data){
    var objKey = 'json/' + this.userID + '/activityData';
    _uploadPending.apply(this, [true]);
    //We need to disable caching manually for iOS safari on the application JSON.  It is tiny anyways
    var params = {Key: objKey, ContentType: 'application/json',
                  Body: JSON.stringify(data), ACL: 'public-read', CacheControl: 'max-age=0'};
    this.bucket.putObject(params, function (err, data) {
      if (err) {
        console.dir(err);
        console.log(err.stack);
        alert('Error saving application data');
      }
      this.activityJson = params.Body;
      _uploadPending.apply(this, [false]);
      _callListeners.apply(this);
    }.bind(this));
  };

  p.fetchActivityData = function(complete, err){
    var objKey = 'json/' + this.userID + '/activityData';
    var params = {Key: objKey};
    this.bucket.getObject(params, function(err, data){
      var json = '';
      if(err){
        if(err.message === 'Access Denied' && err.statusCode === 403){
          //Their json wasn't on amazon;
          json = "[]";
        } else {
          console.log(err);
          return;
        }
      } else {
        for(var x in data.Body){
          if(parseInt(x) == x){
            json += String.fromCharCode(data.Body[x]);
          }
        }
      }
      this.activityJson = json;
      complete(JSON.parse(json));
      _callListeners.apply(this);
    }.bind(this));
  };

  p.buildImageDataMap = function(onComplete){
    App.imageDataMap = App.imageDataMap || {};
    if(!this.userData.imageData || this.userData.imageData.length === 0){
      onComplete();
      return;
    }
    var numLoaded = 0;
    var numToLoad = this.userData.imageData.length;
    var toLoad = JSON.parse(JSON.stringify(this.userData.imageData));
    var im;
    for(var i = 0; i < toLoad.length; i++){
      if(toLoad[i].dataURI){
        App.imageDataMap[toLoad[i].url] = {url: toLoad[i].url, text: toLoad[i].text,
              dataURI: toLoad[i].dataURI, lastModified: toLoad.lastModified};
        numLoaded++;
      } else if(App.imageDataMap[toLoad[i].url] &&  (toLoad[i].lastModified <=
          App.imageDataMap[toLoad[i].url].lastModified || !App.imageDataMap[toLoad[i].url].lastModified)){
        numLoaded++;
      } else {
        im = ALXUI.createEl('img');
        im.crossOrigin = "Anonymous";
        im.addEventListener('load', _createImageLoad.apply(this, [toLoad[i], im]));
        im.src = toLoad[i].url.replace('https://s3.amazonaws.com/snowflakelearning.com',
            'http://snowflakelearning.com');
      }
      if(numLoaded === numToLoad){
        onComplete();
        return;
      }
    }

    function _createImageLoad(imData, im){
      return function(){
        var canvas = ALXUI.createEl('canvas');
        canvas.width = im.width;
        canvas.height = im.height;
        canvas.getContext('2d').drawImage(im, 0, 0, canvas.width, canvas.height);
        App.imageDataMap[imData.url] = {url: imData.url, dataURI: canvas.toDataURL(),
          text: imData.text, lastModified: imData.lastModified};
        numLoaded++;
        if(numLoaded === numToLoad){
          onComplete();
        } else if(numLoaded > numToLoad){
          console.log('THE BUG!!!!!!!!!!!!!!');
        }
      }.bind(this);
    };

  };

  function _uploadPending(pending){
    this.pending = pending;
    if(pending){
      window.addEventListener('beforeunload', _leavePageWarning);
    } else {
      window.removeEventListener('beforeunload', _leavePageWarning);
    }
    this.dispatcher.trigger('save', pending);
  }

  function _callListeners(){
    if(!this.pending){
      for(var i = 0; i < this.updateListeners.length; i++){
        this.updateListeners[i](this.userData, this.activityJson);
      }
    }
  }

  function _parseUserItem(itemData){
    var res = {};
    for(var x in itemData.Item){
      var typedData = itemData.Item[x];
      res[x] = typedData[Object.keys(typedData)[0]];
    }
    if(res.imageData){
      res.imageData = JSON.parse(res.imageData);
    } else {
      res.imageData = [];
    }
    return res;
  }

  function _getDBAndBucket(){
    this.db = this.storageManager.getDB();
    this.bucket = this.storageManager.getBucket();
  }

  function _chunkedUpdateDb(){
    clearTimeout(this.dbUpdateTO);
    this.dbUpdateTO = setTimeout(function(){
      this.db.updateItem({TableName: 'Users', Key: {"id" : {"S": this.userID}}, 'AttributeUpdates' :
          {imageData: {"Action": "PUT", "Value" : {"S": JSON.stringify(this.userData.imageData)}}}},
          function(err, data){
            if(err){
              console.log(err);
            }
            _uploadPending.apply(this, [false]);
            _callListeners.apply(this);
          }.bind(this));
    }.bind(this), 300);
  }

  function _leavePageWarning(){
    return 'Your images are still being uploaded, if you leave the page now your images will not be ' + 'saved.';
  };

  function _handleFBLogin(response){
    this.fbLoggedIn = true;
    if(this.loginPopup){
      this.loginPopup.hide();
    }
    this.storageManager.handleFBAccessToken(response.authResponse.accessToken);
    FB.api("/me?fields=third_party_id,name,email", _handleUser.bind(this));
  }

  function _handleUser(userData){
    this.userID = this.storageManager.storeThirdPartyId(userData["third_party_id"]);
    mixpanel.track('FBUserLoggedIn')
    _addUserIfNew.apply(this, [userData]);
    this.onLogin(this);
  }

  function _addUserIfNew(userData){
    if(!userData.email){
      this.FBLogin();
      return;
    }
    var item = {
      "id" : {"S": this.userID},
      "name" : {"S": userData.name},
      "email": {"S": userData.email}
    };
    if(window.location.hostname.indexOf('alxgroup.net') !== -1){
      item.dev = {"S": 'true'};
    }
    var expected = {
      "id" : {"Exists": false}
    };
    this.db.putItem({TableName: 'Users', Item: item, Expected: expected}, function(err, data){
      if(err && err.code !== "ConditionalCheckFailedException"){
        console.log(err);
      }
      if(!err){
        mixpanel.track('newUserCreated');
        this.newUser = true;
      }
    }.bind(this));
  }

  function _onlineLoad(){
    _initFB.apply(this);
  }

  function _offlineLoad(){
    this.userID =
        this.storageManager.getThirdPartyId();
    if(this.userID && !App.imageDataMap){
      this.prepopulateImageMapFromCache(
          function(){
            this.onLogin(this)
          }.bind(this));
    }
  }

  function _initFB(noLoginPopup){
    if(window.navigator.onLine){
      window.fbAsyncInit = function(){
        FB.init({ appId: appId, xfbml: true });
        FB.Event.subscribe('auth.authResponseChange', this.checkFBLogin.bind(this));
        if(!App.imageDataMap){
          this.prepopulateImageMapFromCache(this.load.bind(this));
        }
        if(!this.loginPopup && !noLoginPopup){
          this.loginPopup = new App.LoginPopup(this.dispatcher);
        }
        this.checkFBLogin();
        if(window.navigator.standalone && !this.override){
          this.loginPopup.overrideFBButton();
        }
      }.bind(this);
      _importFB.apply(this, [noLoginPopup]);
    }
  }

  function _importFB(noButton){
    if(!noButton && !this.fbButton){
      this.fbButton = ALXUI.addEl(document.body, 'div');
      this.fbButton.setAttribute('id', 'fblogin');
      this.fbButton.setAttribute('class', 'fb-login-button');
      this.fbButton.setAttribute('data-width', "200");
      this.fbButton.setAttribute('data-autologoutlink', "true");
      this.fbButton.setAttribute('data-size', "xlarge");
      this.fbButton.setAttribute('scope', "email");
      ALXUI.hide(this.fbButton);
    }
    // Load the Facebook SDK asynchronously
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  App.AccountManager = AccountManager;
}());