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

  var LoginPopup = function() {
    this.initialize();
  };

  var p = LoginPopup.prototype = new App.Popup();
  p.popupInitialize = p.initialize;

  p.initialize = function() {
    this.popupInitialize(document.body);
    ALXUI.styleEl(this.popupDiv, {position: 'absolute'});
    ALXUI.styleEl(this.div, {position: 'absolute', overflow: 'auto'});
    this.banner = ALXUI.addEl(this.popupDiv, 'div', bannerStyle);
    this.setTitle('Snowflake Learning');
    ALXUI.styleEl(this.title, titleStyle);
    this.banner.appendChild(this.title);
    this.subTitle = ALXUI.addEl(this.banner, 'div', subtitleStyle);
    this.subTitle.textContent = 'Personalized Educational Apps as Unique as Your Child';
    this.addBannerSnowflakes();
    this.fbLoginButton = document.getElementById('fblogin');
    ALXUI.styleEl(this.fbLoginButton, fbStyle);
    this.content = ALXUI.addEl(this.popupDiv, 'div', contentStyle);
    this.content.appendChild(this.fbLoginButton);
    this.setSize(700, 600);
    this.intro = ALXUI.addEl(this.content, 'div', introStyle);
    this.intro.textContent = 'Welcome to the Snowflake Visual Planner Beta!';
    this.subIntro = ALXUI.addEl(this.content, 'div', subintroStyle);
    this.subIntro.innerHTML = 'The Snowflake Planner lets you create customized visual activity plans in minutes.<br/>' +
        'Your activities are hosted in the cloud, and are accessible from any computer or tablet.';
    for(var i = 0; i < 3; i++){
      var box = ALXUI.addEl(this.content, 'div', boxStyle);
      var icon = ALXUI.addEl(box, 'div', iconStyle);
      ALXUI.setBackgroundImage(icon, BULLETS[i].icon);
      var bullet = ALXUI.addEl(box, 'div', bulletStyle);
      bullet.textContent = BULLETS[i].text;
    }
  };

  p.showAuthorizing = function(){
    ALXUI.hide(this.fbLoginButton);

    //TODO
  };

  p.addBannerSnowflakes = function(){
    this.bannerSnowflakes = [];
    for(var i = 1; i <= NUM_SNOWFLAKES; i++){
      var sf = ALXUI.addEl(this.banner, 'div', bannerSnowflakeStyle);
      ALXUI.setBackgroundImage(sf, SF_PREFIX + i + '.svg');
      this.bannerSnowflakes.push(sf);
      App.css.addTransitionStyle(['all'], sf, SPIN_TIME);
      setTimeout(_createBannerSFDrop(sf), 500 + i * 400);
    }
    _bannerTwinkle.apply(this);
  };

  function _createBannerSFDrop(sf){
    return function(){
      ALXUI.styleEl(sf, {marginTop: 10});
      _spinFlake(sf);
    }
  }

  function _bannerTwinkle(){
    clearTimeout(this.bannerTwinkleTO);
    this.bannerTwinkleTO = setTimeout(_bannerTwinkle.bind(this), 5000 + Math.random() * 5000);
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
    bottom: 15,
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
    bottom: 0,
    right: 0,
    fontFamily: App.MAIN_FONT,
    left: 0,
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
    marginLeft: 10,
    marginRight: 10,
  };

  var boxStyle = {
    marginTop: 35,
    width: 200,
    marginLeft: 25,
    height: 140,
    cssFloat: 'left',
    textAlign: 'center',
  };

  var iconStyle = {
    width: 200,
    height: 70,
    marginBottom: 10,
  };

  var bulletStyle = {
    width: 200,
    height: 30,
  };

  App.LoginPopup = LoginPopup;
}(App));