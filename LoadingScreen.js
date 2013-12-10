/**
 * Created by Alex on 12/10/13.
 */
window.App = window.App || {};
(function(App){

  var LoadingScreen = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = LoadingScreen.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.dispatcher = dispatcher;
    this.div = ALXUI.addEl(parentNode, 'div', mainStyle);
    this.dispatcher.bind('load', this.hide, this);
    this.text = ALXUI.addEl(this.div, 'div', textStyle);
    this.text.textContent = 'Loading...';
  };

  p.hide = function(){
    ALXUI.hide(this.div);
  };

  var mainStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#336699',
    zIndex: 1000000000000,
  };

  var textStyle = {
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
    height: 50,
    lineHieght: 50,
    top: '50%',
    marginTop: -25,
    color: 'white',
    fontFamily: App.MAIN_FONT,
    fontSize: 36,
  };

  App.LoadingScreen = LoadingScreen;
}(App));
