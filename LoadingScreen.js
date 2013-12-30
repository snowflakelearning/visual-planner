/**
 * Created by Alex on 12/10/13.
 */
window.App = window.App || {};
(function(App){

  var LoadingScreen = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = LoadingScreen.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  var p = LoadingScreen.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.baseInitialize(parentNode, dispatcher, mainStyle);
    this.text = this.addDiv(textStyle, 'Loading...');
    this.dispatcher.bind('loadingComplete', this.hide, this);
  };

  var mainStyle = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
