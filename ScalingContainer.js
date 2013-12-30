/**
 * Created by Alex on 12/13/13.
 */
window.App = window.App || {};
(function(App){
  var ScalingContainer = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = ScalingContainer.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;
  p.initialize = function(parentNode, dispatcher) {
    this.baseInitialize(parentNode, dispatcher, outContainerStyle);
    this.transformDiv = this.addDiv();
    this.innerContainer = ALXUI.addDivTo(this.transformDiv, inContainerStyle);
    ALXUI.addTouchScrolling(this.innerContainer, this.transformDiv);
    this.innerContainer.addEventListener('touchstart', function(event){});
    App.css.fixWidth(this.transformDiv, App.BOX_WIDTH, this.innerContainer);
  };

  var inContainerStyle = {
    width: App.BOX_WIDTH,
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'absolute',
  };

  var outContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  };

  App.ScalingContainer = ScalingContainer;
}(App));