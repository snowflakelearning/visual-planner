window.App = window.App || {};
(function(App){

  var INTRO_IMAGE = 'images/info_i.svg';
  var ONLINE = 'images/online.svg';

  var Header = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = Header.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.baseInitialize(parentNode, dispatcher, headerStyle);
    this.title = this.addDiv(titleStyle, 'Snowflake Planner');
    this.buttonContainer = this.addDiv(containerStyle);
    this.divider = ALXUI.addDivTo(this.buttonContainer, dividerStyle);
    this.introButton = ALXUI.addDivTo(this.buttonContainer, introStyle, null, _onIntroClick.bind(this));
    this.divider2 = ALXUI.addDivTo(this.buttonContainer, dividerStyle);
    this.onlineIcon = ALXUI.addDivTo(this.buttonContainer, [introStyle, {opacity: 1, cursor: 'default'}]);
    ALXUI.setBackgroundImage(this.onlineIcon, ONLINE);
    ALXUI.setBackgroundImage(this.introButton, INTRO_IMAGE);
    App.css.addMouseOver(this.introButton, introHighlightStyle, introStyle);
    this.dispatcher.bind('online', _onOnline.bind(this));
    this.dispatcher.bind('offline', _onOffline.bind(this));
    if(window.navigator.onLine){
      App.addUserVoice();
      _checkForUVLoad.apply(this);
      _onOnline.apply(this);
    } else {
      _onOffline.apply(this);
    }
  };

  function _onOnline(){
    ALXUI.styleEl(this.onlineIcon, {opacity: 1});
    this.onlineIcon.title = 'You are connected to the internet and you changes are being saved to the cloud.';
    ALXUI.show(this.divider);
    if(this.uservoiceButton){
      ALXUI.show(this.uservoiceButton);
    } else {
      App.addUserVoice();
      _checkForUVLoad.apply(this);
    }
  }

  function _onOffline(){
    ALXUI.styleEl(this.onlineIcon, {opacity: 0.5});
    this.onlineIcon.title = 'You are currently offline and edit mode is disabled.';
    ALXUI.hide(this.divider);
    if(this.uservoiceButton){
      ALXUI.hide(this.uservoiceButton);
    }
    this.dispatcher.trigger('editMode', false);
  }

  function _checkForUVLoad(){
    clearTimeout(this.UVLoadTO);
    this.uservoiceButton = document.querySelector('.uv-icon');
    if(this.uservoiceButton){
      this.buttonContainer.insertBefore(this.uservoiceButton, this.divider);
      ALXUI.styleEl(this.uservoiceButton, uservoiceStyle);
      this.uservoiceButton.title = 'Ask for help or send feedback';
    } else {
      setTimeout(_checkForUVLoad.bind(this), 200);
    }
  }

  function _onIntroClick(e){
    this.dispatcher.trigger('showIntro');
  }

  var titleStyle = {
    marginLeft: 20,
    cssFloat: 'left',
    fontSize: 32,
    textShadow: 'rgb(0, 0, 0) 0px -1px 0px',
  };

  var headerStyle = {
    fontFamily: App.MAIN_FONT,
    lineHeight: 80,
    height: 80,
    width: '100%',
    backgroundColor: '#0e7cb7',
    color: 'white',
  };

  var uservoiceStyle = {
    cssFloat: 'right',
    margin: 25,
    marginRight: 0,
    height: 50,
    width: 40,
    position: 'relative',
  };

  var containerStyle = {
    cssFloat: 'right',
    marginRight: 25,
  };


  var introStyle = {
    width: 38,
    height: 38,
    cssFloat: 'right',
    margin: 21,
    position: 'relative',
    marginRight: 4,
    marginLeft: 14,
    opacity: 0.8,
    cursor: 'pointer',

  };

  var dividerStyle = {
    cssFloat: 'right',
    marginLeft: 36,
    height: 38,
    width: 0,
    borderRight: 'solid 1px #ccc',
    marginTop: 21,
    marginLeft: 15,
    marginRight: 5,
  }

  var introHighlightStyle = {
    opacity: 1,
  };

  App.Header = Header;
}(App));