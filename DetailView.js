/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  var BACK_IMAGE = 'images/back-arrow.svg';
  var im = ALXUI.createEl('img');
  im.src = BACK_IMAGE;

  var DetailView = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = DetailView.prototype;
  p.popupInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.dispatcher = dispatcher;
    this.div = ALXUI.addEl(parentNode, 'div', mainStyle);
    this.list = new App.ActivityList(this.div, this.dispatcher);
    this.list.header.textContent = '';
    this.back = ALXUI.addEl(this.list.header, 'div', backStyle);
    this.showAll = ALXUI.addEl(this.list.header, 'div', showAllStyle);
    this.showAll.textContent = 'Show all steps';
    this.showAll.title = 'Show any steps that have been hidden';
    this.title = ALXUI.addEl(this.list.header, 'div', titleStyle)
    ALXUI.styleEl(this.list.div, listStyle);
    this.dispatcher.bind('editMode', this.hide, this);
    App.css.addTouchClickEvent(this.back, function(){
      this.dispatcher.trigger('exitDetailView');
      mixpanel.track('backFromSteps');
    }.bind(this));
    App.css.addTouchClickEvent(this.showAll, function(){
      this.dispatcher.trigger('showAllSteps');
      mixpanel.track('showAllSteps');
      ALXUI.hide(this.showAll);
      _updateBoxes.apply(this);
      _stripeBoxes.apply(this);
    }.bind(this));
    this.dispatcher.bind('hideStep', function(){
      ALXUI.show(this.showAll);
      _updateBoxes.apply(this);
      _stripeBoxes.apply(this);
    }, this);
    ALXUI.hide(this.showAll);
  };

  p.show = function(data, title){
    ALXUI.show(this.div);
    this.title.textContent = title;
    this.list.update(data, true);
    this.list.hideAddSteps();
    _updateBoxes.apply(this);
    _stripeBoxes.apply(this);
  };

  p.hide = function(){
    ALXUI.hide(this.div);
  };

  function _stripeBoxes(){
    var count = 0;
    _.each(this.list.dataRows, function(dr){
      if(!dr.hidden){
        dr.stripe(count);
        count++;
      }
    });
    if(count === 0){
      this.list.empty.show(true);
    } else {
      this.list.empty.hide();
    }
  }

  function _updateBoxes(){
    var hidden = false;
    _.each(this.list.dataRows, function(dr){
      if(!dr.hidden){
        ALXUI.styleEl(dr.div, {display: 'block'});
      } else {
        hidden = true;
      }
      dr.goDetailView();
    });
    if(hidden){
      ALXUI.show(this.showAll);
    } else {
      ALXUI.hide(this.showAll);
    }
  }

  var listStyle = {
    width: '100%',
    position: 'absolute',
  };

  var mainStyle = {
    backgroundColor: 'white',
    display: 'none',
    width: '100%',
  };

  var titleStyle = {
    cssFloat: 'left',
    marginLeft: 20,
  };

  var backStyle = {
    cssFloat: 'left',
    marginTop: 5,
    height: 30,
    width: 30,
    backgroundImage: 'url(' + BACK_IMAGE + ')',
    marginLeft: 20,
    cursor: 'pointer'
  };

  var showAllStyle = {
    width: 150,
    fontSize: 16,
    lineHeight: 30,
    height: 30,
    marginTop: 5,
    cssFloat: 'right',
    marginRight: 20,
    backgroundColor:App.DARK_BLUE,
    color: 'white',
    textAlign: 'center',
    borderRadius: 3,
    cursor: 'pointer',
  };

  App.DetailView = DetailView;
}(App));