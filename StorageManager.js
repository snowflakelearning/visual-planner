/**
 * Created by Alex on 12/4/13.
 */
window.App = window.App || {};
(function(App){

  var roleArn = App.ARN;
  var s3Prefix = 'https://s3.amazonaws.com/snowflakelearning.com/';
  var bucketName = 'snowflakelearning.com';

  var StorageManager = function(dispatcher) {
    this.initialize(dispatcher);
  };

  var p = StorageManager.prototype;
  p.initialize = function(dispatcher) {
    this.dispatcher = dispatcher;
    this.awsBucket = new AWS.S3({params: {Bucket: bucketName}});
    this.awsDB = new AWS.DynamoDB({region: 'us-east-1'});
    this.websqlDB = new App.WebsqlDB(this.dispatcher);
    this.websqlBucket = new App.WebsqlBucket(this.dispatcher);
    this.noDataWarningShown = false;
  };

  p.storeThirdPartyId = function(id){
    localStorage.setItem('fbThirdPartyId', id);
    return id;
  };

  p.getThirdPartyId = function(){
    var token = localStorage.getItem('fbThirdPartyId');
    if(!token && this.noDataWarningShown){
      alert('Sorry, your account data is not currently available offline ' +
          '(you may have cleared your cookies). Please relaunch this ' +
          'program when you have an internet connection to re-download ' +
          'your data for offline use.');
    }
    return token;
  };

  p.handleFBAccessToken = function(token){
    var credentials = new AWS.WebIdentityCredentials({
      ProviderId: 'graph.facebook.com',
      RoleArn: roleArn,
      WebIdentityToken: token,
    });
    this.awsBucket.config.credentials = credentials;
    this.awsDB.config.credentials = credentials;
  };

  p.getDB = function(){
    if(window.navigator.onLine){
      return this.awsDB;
    } else {
      return this.websqlDB;
    }
  };

  p.getBucket= function(){
    if(window.navigator.onLine){
      return this.awsBucket;
    } else {
      return this.websqlBucket;
    }
  };

  p.storeLocal = function(data, activityJson){
    clearTimeout(this.storeLocalTO);
    this.storeLocalTO = setTimeout(function(){
      this.websqlDB.overwriteUserData(data, activityJson);
    }.bind(this), 1000);
  };

  p.getLocalImageData = function(callback){
    var token = this.getThirdPartyId();
    if(!token){
      callback([]);
    } else {
      this.websqlDB.getItem({TableName: 'Users', Key: {id: {S: token}}}, function(err, data){
        callback(JSON.parse(data.Item.imageData.S));
      });
    }
  };

  App.StorageManager = StorageManager;
}(App));
