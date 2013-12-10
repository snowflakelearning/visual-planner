/**
 * Created by Alex on 11/22/13.
 */
window.App = window.App || {};
(function(App){

  var EMPTY_ARROW = 'images/arrowup.svg';

  var Empty = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = Empty.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.dispatcher = dispatcher;
    this.div = ALXUI.addEl(parentNode, 'div', emptyStyle);
    this.emptyArrow = ALXUI.addEl(this.div, 'div', emptyArrowStyle);
    ALXUI.setBackgroundImage(this.emptyArrow, EMPTY_ARROW);
    this.emptyText = ALXUI.addEl(this.div, 'div', emptyTextStyle);
    this.dispatcher.bind('editMode', _toggleEditMode, this);
    App.css.addTransitionStyle('top', this.emptyArrow, 1);
    this.arrowUp = true;
    setInterval(_animateEmpty.bind(this), 800);
    this.editMode = false;
  };

  p.show = function(detailView){
    if(detailView){
      this.emptyText.innerHTML =  '~ No steps found ~<br/>Click the "Show all steps" button to view your steps.';
      ALXUI.styleEl(this.emptyArrow, {right: 80});
    } else {
      _toggleEditMode.apply(this, [this.editMode]);
    }
    ALXUI.show(this.div)
  };

  p.hide = function(){
    ALXUI.hide(this.div);
  };

  function _toggleEditMode(on){
    this.editMode = on;
    if(on){
      this.emptyText.innerHTML = '~ No activities found ~<br/>Click the "Add" button create a new activity.';
      ALXUI.styleEl(this.emptyArrow, {right: 140});
    } else {
      this.emptyText.innerHTML = '~ No activities found ~<br/>Go to "Edit" mode to start adding activities.';
      ALXUI.styleEl(this.emptyArrow, {right: 38});
    }
  }

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
    height: '100%',
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