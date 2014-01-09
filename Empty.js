/**
 * Created by Alex on 11/22/13.
 */
window.App = window.App || {};
(function(App){

  var EMPTY_ARROW = 'images/arrowup.svg';

  var Empty = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = Empty.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.baseInitialize(parentNode, dispatcher, emptyStyle);
    this.emptyArrow = this.addDiv(emptyArrowStyle);
    ALXUI.setBackgroundImage(this.emptyArrow, EMPTY_ARROW);
    this.emptyText = this.addDiv(emptyTextStyle);
    App.css.addTransitionStyle('top', this.emptyArrow, 1);
    this.arrowUp = true;
    setInterval(_animateEmpty.bind(this), 800);
    this.editMode = false;
  };

  p.show = function(detailView){
    if(detailView){
      this.emptyText.innerHTML =  '~ No steps found ~<br/>Click the "Show all steps" button to view your steps.';
      ALXUI.styleEl(this.emptyArrow, {right: 255});
    } else {
      this.emptyText.innerHTML = '~ No activities found ~<br/>Click the "Create New" button create a new activity.';
      ALXUI.styleEl(this.emptyArrow, {right: 80});
    }
    ALXUI.show(this.div)
  };

  function _animateEmpty(){
    this.arrowUp = !this.arrowUp;
    if(this.arrowUp){
      ALXUI.styleEl(this.emptyArrow, {top: 10});
    } else {
      ALXUI.styleEl(this.emptyArrow, {top: 15});
    }
  };

  var emptyArrowStyle = {
    position: 'absolute',
    right: 133,
    height: 30,
    width: 30,
    top: 10,
  };

  var emptyStyle = {
    position: 'relative',
    width: '100%',
    //height: '100%',
  };

  var emptyTextStyle = {
    position: 'absolute',
    top: 60,
    left: App.BOX_WIDTH / 2,
    width: 600,
    marginLeft: -300,
    fontSize: 24,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 80,
  };

  App.Empty = Empty;
}(App));