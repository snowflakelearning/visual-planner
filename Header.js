window.App = window.App || {};
(function(App){

  var INTRO_IMAGE = 'images/info_i.svg';

  var Header = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = Header.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.dispatcher = dispatcher;
    this.div = ALXUI.addEl(parentNode, 'div', headerStyle);
    this.title = ALXUI.addEl(this.div, 'div', titleStyle);
    this.title.textContent = 'Snowflake Planner';
    this.introButton = ALXUI.addEl(this.div, 'div', introStyle);
    ALXUI.setBackgroundImage(this.introButton, INTRO_IMAGE);
    App.css.addTouchClickEvent(this.introButton, _onIntroClick.bind(this));
    this.introButton.addEventListener('mouseover', function(){
      ALXUI.styleEl(this.introButton, introHighlightStyle);
    }.bind(this));
    this.introButton.addEventListener('mouseout', function(){
      ALXUI.styleEl(this.introButton, introStyle);
    }.bind(this));
    App.addUserVoice();
    _checkForUVLoad.apply(this);
  };

  function _checkForUVLoad(){
    clearTimeout(this.UVLoadTO);
    this.uservoiceButton = document.querySelector('.uv-icon');
    if(this.uservoiceButton){
      this.div.insertBefore(this.uservoiceButton, this.introButton);
      ALXUI.styleEl(this.uservoiceButton, uservoiceStyle);
      this.uservoiceButton.title = 'Ask for help or send feedback';
    } else {
      setTimeout(_checkForUVLoad.bind(this), 200);
    }
  }

  function _onIntroClick(e){
    console.log('intro');
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
    position: 'relative',
  };

  var introStyle = {
    width: 38,
    height: 38,
    cssFloat: 'right',
    margin: 21,
    position: 'relative',
    marginRight: 4,
    opacity: 0.8,
    cursor: 'pointer',
    paddingRight: 36,
    borderRight: 'solid 1px #ccc',

  };

  var introHighlightStyle = {
    opacity: 1,
  };

  App.Header = Header;
}(App));