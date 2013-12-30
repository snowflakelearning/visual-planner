/**
 * Created by Alex on 11/8/13.
 */
window.App = window.App || {};
(function(){

  //Add a global function for userID lookup
  App.getUserID = function(){
    return localStorage.getItem('fbThirdPartyId');
  };

  var AccountManager = function(dispatcher){
    if(dispatcher){
      this.initialize(dispatcher);
    }
  };

  var p = AccountManager.prototype;

  p.initialize = function(dispatcher){
    this.dispatcher = dispatcher;
    this.FBManager = new App.FBManager(this.dispatcher);
    this.storageManager = new App.StorageManager(this.dispatcher);
    this.loginPopup = new App.LoginPopup(this.dispatcher);

    window.addEventListener('offline', function(){
      this.dispatcher.trigger('offline');
    }.bind(this));

    window.addEventListener('online', function(){
      this.dispatcher.trigger('online');
    }.bind(this));

    if(window.navigator.onLine){
      this.dispatcher.trigger('online');
    } else {
      this.dispatcher.trigger('offline');
    }

    _offlineLoad.apply(this);
    this.dispatcher.bind('FBLogin', _addUser, this);
  };

  function _offlineLoad(){
    if(App.getUserID()){
      this.storageManager.getActivityData(true);
    }
  }

  function _addUser(userData){
    this.storageManager.addUser(userData,
        window.location.hostname.indexOf('alxgroup.net') !== -1);
  }

  App.AccountManager = AccountManager;
}());