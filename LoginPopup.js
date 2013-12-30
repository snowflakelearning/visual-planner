window.App = window.App || {};
(function(App){

  var SF_PREFIX = 'images/snowflake';
  var NUM_SNOWFLAKES = 6;
  var SPIN_TIME = 3;

  var BULLETS = [
    {icon: 'images/galleryIcon.svg', text: 'Upload images to your library'},
    {icon: 'images/schedule.svg', text: 'Create your personal activity plans'},
    {icon: 'images/devices_only.svg', text: 'Access your planner anywhere'},
  ];

  var LoginPopup = function(dispatcher) {
    this.initialize(dispatcher);
  };

  var p = LoginPopup.prototype = new App.Popup();
  p.popupInitialize = p.initialize;

  p.initialize = function(dispatcher) {
    this.popupInitialize(document.body, dispatcher, {position: 'absolute', overflow: 'hidden'});
    ALXUI.styleEl(this.shader, shaderStyle);
    this.setSize(700, 620);
    _setupBanner.apply(this);
    _setupStartContent.apply(this);
    window.addEventListener('blur', function(){
      this.blurred = true;
    }.bind(this));
    window.addEventListener('focus', function(){
      this.blurred = false;
    }.bind(this));
    this.dispatcher.bind('addToHomeNoThanks', _onNoThanks, this);
    this.dispatcher.bind('FBAPILoad', _addFBButton, this);
    this.dispatcher.bind('FBNotAuthorized', this.show, this);
    this.dispatcher.bind('FBUnknown', this.show, this);
    this.dispatcher.bind('FBLogin', this.hide, this);
  };

  p.overrideFBButton = function(){
    //When running as a web app we need to override what the FB login button does per
    //http://stackoverflow.com/questions/11197668/fb-login-broken-flow-for-ios-webapp
    this.override = ALXUI.addDivTo(this.startContent, [fbStyle, {width: 130, height: 40, opacity: 0, zIndex:2}]);
    this.override.addEventListener('touchstart', function(e){
      e.preventDefault();
      e.stopPropagation();
      var fbUrl = "https://m.facebook.com/dialog/oauth?client_id=" + App.FB_APP_ID + "&response_type=code&redirect_uri=" +
          window.location.href + "&scope=email";
      window.location = fbUrl;
    });
  };

  p.addBannerSnowflakes = function(){
    this.bannerSnowflakes = [];
    for(var i = 1; i <= NUM_SNOWFLAKES; i++){
      var sf = ALXUI.addDivTo(this.banner, bannerSnowflakeStyle);
      ALXUI.setBackgroundImage(sf, SF_PREFIX + i + '.svg');
      this.bannerSnowflakes.push(sf);
      App.css.addTransitionStyle(['all'], sf, SPIN_TIME);
      setTimeout(_createBannerSFDrop(sf), 500 + i * 400);
      _createClickSpin(sf);
    }
    _bannerTwinkle.apply(this);
  };

  function _setupBanner(){
    this.banner = this.addDiv(bannerStyle);
    this.setTitle('Snowflake Learning');
    ALXUI.styleEl(this.title, titleStyle);
    this.banner.appendChild(this.title);
    this.subTitle = ALXUI.addDivTo(this.banner, subtitleStyle,
        'Personalized Educational Apps as Unique as Your Child');
    this.addBannerSnowflakes();
  }

  function _setupStartContent(){
    this.startContent = this.addDiv(contentStyle);
    App.css.addTransitionStyle(['margin-left'], this.startContent, 1);
    this.intro = ALXUI.addDivTo(this.startContent, introStyle, 'Welcome to the Snowflake Visual Planner Beta!');
    this.startButton = ALXUI.addDivTo(this.startContent, startStyle, 'Start Planning', function(){
      mixpanel.track('startPlanningClicked');
      _showHomeScreenInfo.apply(this);
    }.bind(this));
    if(window.navigator.standalone || !App.css.osIsIOS()){
      ALXUI.hide(this.startButton);
    }
    this.bottomContainer = ALXUI.addDivTo(this.startContent, bottomContainerStyle);
    this.subIntro = ALXUI.addDivTo(this.bottomContainer, subintroStyle);
    this.subIntro.innerHTML = 'The Snowflake Planner lets you create customized visual activity plans in minutes.<br/>' +
        'Your activities are hosted in the cloud, and are accessible from any computer or tablet.';
    for(var i = 0; i < 3; i++){
      var box = new App.IconBullet(this.bottomContainer, this.dispatcher, BULLETS[i]);
    }
  }

  function _addFBButton(fbButton){
    this.fbLoginButton = fbButton;
    ALXUI.styleEl(this.fbLoginButton, [fbStyle, {display: 'block', zIndex: -1}]);
    this.startContent.appendChild(this.fbLoginButton);
    if(window.navigator.standalone || !App.css.osIsIOS()){
      ALXUI.styleEl(this.fbLoginButton, {zIndex: 1});
    }
    if(window.navigator.standalone){
      this.overrideFBButton();
    }
  }

  function _showHomeScreenInfo(){
    this.addToHome = new App.AddToHome(this.div, this.dispatcher);
    ALXUI.styleEl(this.addToHome.div, {marginLeft: 700});
    App.css.addTransitionStyle(['margin-left'], this.addToHome.div, 1);
    ALXUI.styleEl(this.startContent, {marginLeft: -700});
    setTimeout(function(){
      ALXUI.styleEl(this.addToHome.div, {marginLeft: 0});
    }.bind(this), 30);
  }

  function _onNoThanks(){
    mixpanel.track('userClickedNoThanksToWebApp');
    ALXUI.styleEl(this.fbLoginButton, {zIndex: 1});
    ALXUI.hide(this.startButton);
    this.intro.textContent = 'Please log in with Facebook to get started';
    ALXUI.styleEl(this.startContent, {marginLeft: 0});
    ALXUI.styleEl(this.addToHome.div, {marginLeft: 700});
  }

  function _createClickSpin(flake){
    App.css.addTouchClickEvent(flake, function(){
      _spinFlake(flake);
    });
  }

  function _createBannerSFDrop(sf){
    return function(){
      ALXUI.styleEl(sf, {marginTop: 10});
      _spinFlake(sf);
    }
  }

  function _bannerTwinkle(){
    clearTimeout(this.bannerTwinkleTO);
    this.bannerTwinkleTO = setTimeout(_bannerTwinkle.bind(this), 5000 + Math.random() * 5000);
    if(this.blurred){
      return;
    }
    var flake = this.bannerSnowflakes[Math.floor(Math.random() * NUM_SNOWFLAKES)];
    _spinFlake(flake);
  };

  function _spinFlake(flake){
    flake.rotation = flake.rotation || 0;
    if(Math.random() > 0.5){
      flake.rotation += 180;
    } else {
      flake.rotation -= 180;
    }
    var flipStyle = App.css.generateRotationStyle(0, flake.rotation);
    ALXUI.styleEl(flake, flipStyle);
  }

  var fbStyle = {
    position: 'absolute',
    left: '50%',
    marginLeft: -62.5,
    bottom: 240,
    width: 125,
  };

  var bannerStyle = {
    width: '100%',
    height: 235,
    backgroundImage: 'linear-gradient(22deg, rgb(93, 242, 255) 0%,' +
        'rgb(85, 141, 255) 56%, rgb(194, 95, 255) 100%)',
    fontFamily: App.MAIN_FONT,
    color: 'white',
    overflow: 'hidden',
  };

  var titleStyle = {
    position: 'absolute',
    top: 125,
    width: '100%',
    textAlign: 'right',
    right: 25.3,
    fontWeight: 300,
    fontSize: 48,
    letterSpacing: 3,
  };

  var subtitleStyle = {
    position: 'absolute',
    top: 195,
    width: '100%',
    textAlign: 'right',
    right: 38,
    fontSize: 18,
  };

  var bannerSnowflakeStyle = {
    width: 100,
    height: 100,
    cssFloat: 'left',
    margin: 100 / (NUM_SNOWFLAKES * 2),
    marginTop: -120,
  };

  var contentStyle = {
    position: 'absolute',
    top: 235,
    width: '100%',
    fontFamily: App.MAIN_FONT,
    bottom: 0,
  };

  var introStyle = {
    width: '100%',
    textAlign: 'center',
    color: App.DARK_BLUE,
    fontSize: 30,
    marginTop: 25,
    marginBottom: 25,
  };

  var subintroStyle = {
    textAlign: 'center',
    color: '#434343',
    fontSize: 16,
    margin: 10,
  };

  var bottomContainerStyle = {
    position: 'absolute',
    width: '100%',
    height: 210,
    bottom: 0,
    backgroundColor: '#f2f2f2',
  };

  var shaderStyle = {
    position: 'absolute',
    //minHeight: 620,
    backgroundImage: App.css.generateBrowserSpecificGradient('#888', '#333', 'radial', '50%', '50%'),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  };

  var startStyle = {
    position: 'absolute',
    left: '50%',
    marginLeft: -150,
    bottom: 245,
    width: 300,
    height: 50,
    backgroundColor: '#7580ff',
    border: '1px solid ' + App.DARK_BLUE,
    color: 'white',
    textAlign: 'center',
    borderRadius: 3,
    fontSize: 26,
    lineHeight: 50,
    cursor: 'pointer',
    position: 'absolute',
  };

  App.LoginPopup = LoginPopup;
}(App));