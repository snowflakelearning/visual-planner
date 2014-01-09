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
    this.reverse = this.addRightHeaderButton('Reverse steps', _onReverse.bind(this));
    ALXUI.styleEl(this.reverse, reverseStyle);
    ALXUI.styleEl(this.showAll, showAllStyle);
    this.showAll.title = 'Show any steps that have been hidden';
    ALXUI.hide(this.headerTitle);
    this.dispatcher.bind('stepHidden', function(){
      ALXUI.show(this.showAll);
      _updateBoxes.apply(this);
      _stripeBoxes.apply(this);
    }, this);
    ALXUI.hide(this.showAll);
    this.empty.hide();
    this.empty = new App.ActivityCompletePopup(document.body, this.dispatcher);
  };

  p.onModelChange = function(model, data){
    this.update(this.filterToTargetActivity(data || model.getActivityData(), true), true);
  };

  p.activityListUpdate = p.update;
  p.update = function(data, stripe){
    if(this.div.style.display == "none"){
      return;
    }
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
    this.clear();
    this.baseShow();
    this.setTargetActivity(data);
    this.onModelChange(null, modelData);
    this.dispatcher.trigger('setStepAnimate', !data.noStepCelebration);
    if(this.isEmpty){
      _onShowAll.apply(this);
    }
    this.empty.preloadYoutube(this.targetActivityData.reward);
  };

  function _onShowAll(){
    this.dispatcher.trigger('showAllSteps');
    mixpanel.track('showAllSteps');
    ALXUI.hide(this.showAll);
    _updateBoxes.apply(this);
    _stripeBoxes.apply(this);
  }

  function _onReverse(){
    var i = this.listContainer.childNodes.length - 1;
    while(i > 0){
      this.listContainer.appendChild(this.listContainer.childNodes[i]);
      i--;
    }
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
      this.isEmpty = true;
      if(this.targetActivityData){
        this.empty.show(this.targetActivityData.reward);
      }
    } else {
      this.isEmpty = false;
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

  var reverseStyle = {
    display: 'block',
  };

  var showAllStyle = {
    right: 200,
  };

  App.DetailView = DetailView;
}(App));