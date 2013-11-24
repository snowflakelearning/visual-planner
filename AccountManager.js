/**
 * Created by Alex on 11/8/13.
 */
window.App = window.App || {};
(function(){

  //Add a global function for looking up image data based on its URL
  //The account manager updates the map that this function uses every time
  //it gets new server data from getUserImages
  App.getImageData = function(url){
    if(url.indexOf('user-images') !== -1){
      return this.imageDataMap[url];
    } else {
      return {url: url, text: ""};
    }
  };

  var appId = App.FB_APP_ID;
  var roleArn = App.ARN;
  var bucketName = 'VPTestApp';
  var s3Prefix = 'https://s3.amazonaws.com/VPTestApp/';

  var AccountManager = function(onLogin, dispatcher){
    this.initialize(onLogin, dispatcher);
  };

  var p = AccountManager.prototype;

  p.initialize = function(onLogin, dispatcher){
    this.dispatcher = dispatcher;
    FB.init({ appId: appId, xfbml: true });
    FB.Event.subscribe('auth.authResponseChange', this.checkFBLogin.bind(this));
    this.onLogin = onLogin;
    this.userID = null
    this.bucket = new AWS.S3({params: {Bucket: bucketName}});
    this.db = new AWS.DynamoDB({region: 'us-east-1'});
    this.loginPopup = new App.LoginPopup();
    this.userData = null;
    this.updateListeners = [];
    this.checkFBLogin();
  };

  p.checkFBLogin = function(){
    setTimeout(function(){
      FB.getLoginStatus(function(resp){
        if(!this.fbLoggedIn && resp.status === 'connected'){
          this.fbLoggedIn = true;
          _handleFBLogin.apply(this, [resp]);
        } else if(resp.status === 'not_authorized'){
          this.FBLogin();
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
        App.imageDataMap = this.buildImageDataMap();
        _onComplete(this.userData.imageData);
        _callListeners.apply(this);
      }
    }.bind(this));
  };

  p.addUpdateListener = function(func){
    this.updateListeners.push(func);
  };

  p.pushImageToS3 = function(fileData, fileType, objKey){
    if(this.pending){
      setTimeout(function(){ this.pushImageToS3(fileData, fileType, objKey)
      }.bind(this), 1000);
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
          this.userData.imageData.push({url: s3Prefix + objKey});
          _chunkedUpdateDb.apply(this);
        }
      }.bind(this));
    }.bind(this), function(err, data){
      console.log(err);
    })
  };

  p.updateImageText = function(imData){
    //A full on queuing system would be better
    if(this.pending){
      setTimeout(function(){
        this.updateImageText(imData)
      }.bind(this), 1000);
      return;
    }
    _uploadPending.apply(this, [true]);
    this.getUserImages(function(){
      var toChange = _.find(this.userData.imageData, function(im){
        return im.url === imData.url;
      });
      if(toChange){
        for(var x in imData){
          toChange[x] = imData[x];
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
      _uploadPending.apply(this, [false]);
    }.bind(this));
  };

  p.fetchActivityData = function(complete, err){
    var objKey = 'json/' + this.userID + '/activityData';
    var req = new XMLHttpRequest()
    if(req.overrideMimeType){  //IE < 11 doesn't support this but seems to carry on okay
      req.overrideMimeType('application/json');
    }
    req.open('GET', s3Prefix + objKey);
    req.addEventListener('load', function(evt){
      if(evt.target.status === 200){
        complete(JSON.parse(evt.target.responseText));
      } else {
        err(evt.target.responseText);
      }
    });
    req.send();
  };

  p.buildImageDataMap = function(){
    var res = {};
    for(var i = 0; i < this.userData.imageData.length; i++){
      res[this.userData.imageData[i].url] = this.userData.imageData[i];
    }
    return res;
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
        this.updateListeners[i](this.userData);
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
    this.loginPopup.hide();
    var credentials = new AWS.WebIdentityCredentials({
      ProviderId: 'graph.facebook.com',
      RoleArn: roleArn,
      WebIdentityToken: response.authResponse.accessToken,
    });
    this.bucket.config.credentials = credentials;
    this.db.config.credentials = credentials;
    FB.api("/me?fields=third_party_id,name,email", _handleUser.bind(this));
  }

  function _handleUser(userData){
    this.userID = userData["third_party_id"];
    _addUserIfNew.apply(this, [userData]);
    this.onLogin(this);
    mixpanel.track('FBUserLoggedIn')
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

  App.AccountManager = AccountManager;
}());