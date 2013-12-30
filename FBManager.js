/**
 * Created by Alex on 12/11/13.
 */
window.App = window.App || {};
(function(App){

  var appId = App.FB_APP_ID;

  var FBManager = function(dispatcher) {
    this.initialize(dispatcher);
  };

  var p = FBManager.prototype;
  p.initialize = function(dispatcher) {
    this.dispatcher = dispatcher;
    this.dispatcher.bind('online', this.initFB, this);
  };

  p.initFB = function(){
    if(!this.FBLoaded){
      if(!this.fbButton){
        _createFBButton.apply(this)
      }
      window.fbAsyncInit = _onFBAPILoad.bind(this);
      _importFB.apply(this);
    }
  };

  p.checkLoginStatus = function(){
    setTimeout(function(){
      FB.getLoginStatus(function(resp){
        if(resp.status === 'connected'){
          //ignore with duplicate events
          if(!this.lastSent || Date.now() - this.lastSent > 1000){
            _getThirdPartyID.apply(this, [resp.authResponse.accessToken]);
            this.lastSent = Date.now();
          }
        } else if(resp.status === 'not_authorized'){
          this.dispatcher.trigger('FBNotAuthorized');
        } else if(resp.status === 'unknown'){
          this.dispatcher.trigger('FBUnknown');
        }
      }.bind(this));
    }.bind(this), 10);
  };

  function _getThirdPartyID(accessToken){
    FB.api("/me?fields=third_party_id,name,email",
        function(userData){
          mixpanel.track('FBUserLoggedIn')
          this.dispatcher.trigger('FBLogin', userData, accessToken)
        });
  }

  function _onFBAPILoad(){
    FB.Event.subscribe('auth.authResponseChange', _onAuthChange.bind(this));
    FB.init({ appId: appId, xfbml: true });
    this.FBLoaded = true;
    this.checkLoginStatus();
    this.dispatcher.trigger('FBAPILoad', this.fbButton);
  }

  function _onAuthChange(){
    this.checkLoginStatus();
  }

  function _createFBButton(){
    this.fbButton = ALXUI.addEl(document.body, 'div');
    this.fbButton.setAttribute('id', 'fblogin');
    this.fbButton.setAttribute('class', 'fb-login-button');
    this.fbButton.setAttribute('data-width', "200");
    this.fbButton.setAttribute('data-size', "xlarge");
    this.fbButton.setAttribute('scope', "email");
    ALXUI.hide(this.fbButton);
  }

  function _importFB(){
    // Load the Facebook SDK asynchronously
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  App.FBManager = FBManager;
}(App));