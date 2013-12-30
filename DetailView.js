/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  var DetailView = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = DetailView.prototype = new App.ActivityList();
  p.activityListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.activityListInitialize(parentNode, dispatcher);
    this.addBackButton(_onBackClick.bind(this));
    this.addBackText();
    this.showAll = this.addRightHeaderButton('Show all steps', _onShowAll.bind(this));
    this.showAll.title = 'Show any steps that have been hidden';
    ALXUI.hide(this.headerTitle);
    this.dispatcher.bind('hideStep', function(){
      ALXUI.show(this.showAll);
      _updateBoxes.apply(this);
      _stripeBoxes.apply(this);
    }, this);
    ALXUI.hide(this.showAll);
  };

  p.onModelChange = function(model, data){
    this.update(this.filterToTargetActivity(data || model.getActivityData(), true), true);
  };

  p.activityListUpdate = p.update;
  p.update = function(data, stripe){
    var parentIndex;
    _.each(data, function(d){
      if(d.parentId === null){
        this.backText.textContent = d.name;
        parentIndex = data.indexOf(d);
      }
    }.bind(this));
    data.splice(parentIndex, 1);
    this.activityListUpdate(data, stripe);
    _updateBoxes.apply(this);
    _stripeBoxes.apply(this);
  };

  p.baseShow = p.show;
  p.show = function(data, modelData){
    this.baseShow();
    this.setTargetActivity(data);
    this.onModelChange(null, modelData);
  };

  function _onShowAll(){
    this.dispatcher.trigger('showAllSteps');
    mixpanel.track('showAllSteps');
    ALXUI.hide(this.showAll);
    _updateBoxes.apply(this);
    _stripeBoxes.apply(this);
  }

  function _stripeBoxes(){
    var count = 0;
    _.each(this.dataRows, function(dr){
      if(!dr.hidden){
        dr.stripe(count);
        count++;
      }
    });
    if(count === 0){
      this.empty.show(true);
    } else {
      this.empty.hide();
    }
  }

  function _updateBoxes(){
    var hidden = false;
    _.each(this.dataRows, function(dr){
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

  function _onBackClick(){
    this.dispatcher.trigger('backToHome');
  }

  App.DetailView = DetailView;
}(App));