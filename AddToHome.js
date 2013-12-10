/**
 * Created by Alex on 12/4/13.
 */
window.App = window.App || {};
(function(App){

  var valueProps = [
      'Offline access to your schedules.',
      'A full screen user interface.',
      'A Snowflake Planner icon on your home screen.'
  ];

  var instructionData = [
    {text: '1. Press <b>"Share"</b> in the Safari Menu Bar', icon: 'images/share_ios.svg'},
    {text: '2. Press <b>"Add to Home Screen"</b>', icon: 'images/save-to-home-screen-ios.svg'},
  ];

  var AddToHome = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = AddToHome.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.dispatcher = dispatcher;
    this.div = ALXUI.addEl(parentNode, 'div', mainStyle);
    this.header = ALXUI.addEl(this.div, 'div', headerStyle);
    this.header.textContent = 'Run the Snowflake Planner as a web app and get';
    this.valueList = ALXUI.addEl(this.div, 'ul', valueListStyle);
    for(var i = 0; i < valueProps.length; i++){
      var li = ALXUI.addEl(this.valueList, 'li', itemStyle);
      li.textContent = valueProps[i];
    }
    this.instructionsContainer = ALXUI.addEl(this.div, 'div', containerStyle);
    this.instructionsHeader = ALXUI.addEl(this.instructionsContainer, 'div',
        [subHeaderStyle, {fontWeight: 700, marginTop: 10}]);
    this.instructionsHeader.textContent = 'To add the Snowflake Planner to your home screen please:';
    for(var i = 0; i < instructionData.length; i++){
      var box = new App.IconBullet(this.instructionsContainer, this.dispatcher, instructionData[i]);
      box.setSize(300, 110);
      box.textOnTop();
      ALXUI.styleEl(box.div, {marginLeft: 33, marginTop: 15});
    }
    this.noThanks = ALXUI.addEl(this.div, 'div', noThanksStyle);
    this.noThanks.textContent = 'No thanks, I\'ll use the planner in Safari';
    App.css.addTouchClickEvent(this.noThanks, function(){
      this.dispatcher.trigger('addToHomeNoThanks');
    }.bind(this));
  };

  var itemStyle = {
    fontSize: 18,
  };

  var mainStyle = {
    fontFamily: App.MAIN_FONT,
    width: '100%',
    top: 235,
    bottom: 0,
    width: '100%',
    marginLeft: 0,
    position: 'absolute',
  };

  var headerStyle = {
    width: '100%',
    textAlign: 'center',
    color: App.DARK_BLUE,
    fontSize: 30,
    marginTop: 25,
    marginBottom: 25,
  };

  var subHeaderStyle = {
    textAlign: 'center',
    color: App.DARK_BLUE,
    fontSize: 18,
    margin: 3,
  };

  var valueListStyle = {
    margin: 0,
    marginTop: -10,
    marginLeft: 150,
  };

  var containerStyle = {
    position: 'absolute',
    width: '100%',
    height: 210,
    bottom: 0,
    backgroundColor: '#f2f2f2',
  };

  var noThanksStyle = {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 300,
    height: 35,
    backgroundColor: '#7580ff',
    border: '1px solid ' + App.DARK_BLUE,
    color: 'white',
    textAlign: 'center',
    borderRadius: 3,
    fontSize: 16,
    lineHeight: 35,
    cursor: 'pointer',
  };

  App.AddToHome = AddToHome;
}(App));