/**
 * Created by Alex on 12/4/13.
 */
window.App = window.App || {};
(function(App){

  var SAVE_CHUNK_TIME = 1000;

  //Add a global function for looking up image data based on its URL
  App.getImageDataURI = function(url){
    if(App.imageDataMapper){
      return App.imageDataMapper.getImageData(url).dataURI;
    }
  };

  var roleArn = App.ARN;
  var bucketName = 'snowflakelearning.com';

  var StorageManager = function(dispatcher) {
    this.initialize(dispatcher);
  };

  var p = StorageManager.prototype;
  p.initialize = function(dispatcher) {
    this.dispatcher = dispatcher;
    this.imageDataMapper = new App.ImageDataMapper(this.dispatcher);
    App.imageDataMapper = this.imageDataMapper;
    this.awsBucket = new AWS.S3({params: {Bucket: bucketName}});
    this.awsDB = new AWS.DynamoDB({region: 'us-east-1'});
    if(!App.css.browserIsFirefox()){
      this.websqlDB = new App.WebsqlDB(this.dispatcher);
      this.websqlBucket = new App.WebsqlBucket(this.dispatcher);
     }
    _setupListeners.apply(this);
    setInterval(function(){
      if(window.navigator.onLine && !this.editing && this.status === 'saved'){
        this.getActivityData(false, true);
      }
    }.bind(this), 30000);

    this.dispatcher.bind('backToHome', function(){ this.editing = false;}, this);
    this.dispatcher.bind('showEditor', function(){ this.editing = true;}, this);

    this.outOfSync = true;
    this.status = "saved";
  };

  p.getActivityData = function(forceOffline, storeLocal){
    var online = window.navigator.onLine && !forceOffline;
    if(online && this.awsBucket.config.credentials){
      this.getServerImageData(function(imData, userData){
        this.getServerActivityData(function(activityData){
          if(storeLocal){
            this.outOfSync = false;
            this.storeLocal(userData, activityData);
          }
        }.bind(this));
      }.bind(this));
    } else {
      this.getLocalImageData(function(imData){
        this.getLocalActivityData(imData);
      }.bind(this));
    }
  };

  p.getImageData = function(forceOffline, callback){
    var online = window.navigator.onLine && !forceOffline;
    if(online && this.awsDB.config.credentials){
      this.getServerImageData(callback);
    } else {
      this.getLocalImageData(callback);
    }
  };

  p.getServerImageData = function(callback){
    _getImageData.apply(this, [this.awsDB, callback]);
  };

  p.getServerActivityData = function(callback){
    _getActivityData.apply(this, [this.awsBucket, callback]);
  };

  p.storeLocal = function(userData, activityData){
    //FF only supports IndexedDB so we'd need to switch everything to indexeddb and use
    //a websql shim or we;d need to make a specific indexdb system to support
    //offline in FF.
    if(!App.css.browserIsFirefox()){
      this.websqlDB.overwriteUserData(userData, activityData);
    }
  };

  p.storeServer = function(imageData, activityData){
    if(this.outOfSync){
      return;
    }
    _uploadPending.apply(this, ['saving']);
    if(window.navigator.onLine && this.awsBucket.config.credentials){
      _updateActivityJson.apply(this, [activityData, this.awsBucket]);
    }
    if(window.navigator.onLine && this.awsDB.config.credentials){
      _updateImageData.apply(this, [imageData, this.awsDB]);
    }
  };

  p.getLocalImageData = function(callback){
    _getImageData.apply(this, [this.websqlDB, callback]);
  };

  p.getLocalActivityData = function(){
    _getActivityData.apply(this, [this.websqlBucket]);

  };

  p.addUser = function(userData, dev){
    var item = {
      "id" : {"S": userData['third_party_id']},
      "name" : {"S": userData.name},
      "email": {"S": userData.email},
      "dev"  : {"S": dev.toString()}
    };
    var expected = {
      "id" : {"Exists": false}
    };
    if(this.awsDB){
      this.awsDB.putItem({TableName: 'Users', Item: item, Expected: expected}, function(err, data){
        if(err && err.code !== "ConditionalCheckFailedException"){
          console.log(err);
        }
        if(!err){
          mixpanel.track('newUserCreated');
          this.newUser = true;
        }
      }.bind(this));
    }
  };

  function _getImageData(db, callback){
    var token = App.getUserID();
    if(token){
      db.getItem({TableName: 'Users', Key: {id: {S: token}}}, function(err, data){
        if(err){
          console.log(data);
          console.log(err);
          console.dir(err);
          console.log(err.stack);
        } else {
          this.dispatcher.trigger('userDataLoad', data);
          var imData = [];
          if(data && data.Item && data.Item.imageData && data.Item.imageData.S){
            imData = JSON.parse(data.Item.imageData.S);
          }
          this.imageDataMapper.processImages(imData,
              function(imDataArr){
                callback(imDataArr, data);
                this.dispatcher.trigger('imageDataLoad', imDataArr);
              });
        }
      }.bind(this));
    }
  }

  function _getActivityData(bucket, callback){
    var objKey = 'json/' + App.getUserID() + '/activityData';
    var params = {Key: objKey};
    bucket.getObject(params, function(err, data){
      var json = '';
      if(err){
        if(err.message === 'Access Denied' && err.statusCode === 403){
          //Their json wasn't on amazon;
          json = "[]";
        } else {
          console.log(err);
          console.dir(err);
          console.log(err.stack);
          return;
        }
      } else {
        for(var x in data.Body){
          if(parseInt(x) == x){
            json += String.fromCharCode(data.Body[x]);
          }
        }
      }
      var parsed = JSON.parse(json || '[]');
      this.dispatcher.trigger('activityJsonLoad', parsed, false, bucket === this.awsBucket);
      if(callback){
        callback(parsed);
      }
    }.bind(this));
  }

  function _setupListeners(){
    this.dispatcher.bind('newImageUpload', _newImageUpload, this);
    this.dispatcher.bind('FBLogin', _handleFBLogin, this);
    this.dispatcher.bind('saveData', _onSave, this);
    this.dispatcher.bind('online', _onOnline, this);
    this.dispatcher.bind('offline', _onOffline, this);
    this.dispatcher.bind('storeLocal', this.storeLocal, this);
  }

  function _onSave(model){
    _uploadPending.apply(this, ['unsaved']);
    clearTimeout(this.saveTO);
    this.saveTO = setTimeout(function(){
      var userData = model.getUserData();
      var activityData = model.getActivityData();
      this.storeServer(model.getImageData(), activityData);
      this.storeLocal(userData, activityData);
    }.bind(this), SAVE_CHUNK_TIME);
  }

  function _onOnline(){
    if(this.awsBucket.config.credentials){
      this.getActivityData();
    }
  }

  function _onOffline(){
    if(this.awsBucket.config.credentials){
      this.getActivityData();
    }
    this.outOfSync = true;
  }

  function _updateActivityJson(data, bucket){
    var objKey = 'json/' + App.getUserID() + '/activityData';
    //We need to disable caching manually for iOS safari on the application JSON.  It is tiny anyways
    _putObject.apply(this, [bucket, JSON.stringify(data), 'application/json', objKey, function () {
      _uploadPending.apply(this, ['saved']);
    }.bind(this), true]);
  }

  function _newImageUpload(fileData, fileType, key){
    _uploadPending.apply(this, ['saving']);
    _putObject.apply(this, [this.awsBucket, fileData, fileType, key, function(){}]);
  }

  function _putObject(bucket, fileData, fileType, key, callback, nocache){
    var params = {Key: key, ContentType: fileType, Body: fileData, ACL: 'public-read'};
    if(nocache){
      params.CacheControl = 'max-age=0';
    }
    bucket.putObject(params, function (err, data){
      if(err){
        console.log(err);
        console.log(err.stack);
        console.dir(err);
      } else {
        _uploadPending.apply(this, ['saved']);
        callback();
      }
    }.bind(this));
  }

  function _updateImageData(imData, db){
    var id = App.getUserID();
    _uploadPending.apply(this, ['saving']);
    db.updateItem({TableName: 'Users', Key: {"id" : {"S": id}}, 'AttributeUpdates' :
        {imageData: {"Action": "PUT", "Value" : {"S": JSON.stringify(imData)}}}},
        function(err, data){
          _uploadPending.apply(this, ['saved']);
          if(err){
            console.log(err);
          }
        }.bind(this));
  }

  function _uploadPending(status){
    this.status = status;
    this.pending = status !== 'saved';
    if(status !== 'saved'){
      window.addEventListener('beforeunload', _leavePageWarning);
    } else {
      window.removeEventListener('beforeunload', _leavePageWarning);
    }
    this.dispatcher.trigger('save', status);
  }

  function _leavePageWarning(){
    return 'Your images are still being uploaded, if you leave the page now your images will not be ' + 'saved.';
  };

  function _handleFBLogin(userData, token){
    var credentials = new AWS.WebIdentityCredentials({
      ProviderId: 'graph.facebook.com',
      RoleArn: roleArn,
      WebIdentityToken: token,
    });
    this.awsBucket.config.credentials = credentials;
    this.awsDB.config.credentials = credentials;
    localStorage.setItem('fbThirdPartyId', userData['third_party_id']);
    this.getActivityData(false, true);
  }

  App.StorageManager = StorageManager;
}(App));
