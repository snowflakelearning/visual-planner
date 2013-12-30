/**
 * Created by Alex on 12/13/13.
 */
window.App = window.App || {};
(function(App){
  var ActivityEditor = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = ActivityEditor.prototype = new App.ActivityList();
  p.activityListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.activityListInitialize(parentNode, dispatcher);
    this.addBackButton(_onBackClick.bind(this));
    this.addBackText();
    _insertAddButton.apply(this);
    this.saveNotice = ALXUI.addDivTo(this.header, saveStyle, 'All changes saved');
    this.deletePopup = new App.Popup(document.body, this.dispatcher);
    this.deletePopup.setTitle('Are you sure you want to delete this activity?');
    this.deletePopup.setSize(300, 140);
    this.deletePopup.addCancel("right");
    this.dispatcher.bind('save', _onSave, this);
    this.dispatcher.bind('showDeleteActivityConfirm', _showDeleteConfirm, this);
  };

  p.onModelChange = function(model, data){
    this.update(this.filterToTargetActivity(data || model.getActivityData(), true), true);
  };

  p.activityListUpdate = p.update;
  p.update = function(data, stripe){
    this.activityListUpdate(data, stripe);
    _.each(data, function(d){
      if(d.parentId === null){
        this.backText.textContent = d.name;
      }
    }.bind(this));
    _updateBoxes.apply(this);
    if(data.length === 0){
      this.dispatcher.trigger('backToHome');
    }
  };

  p.baseShow = p.show;
  p.show = function(data, modelData){
    this.baseShow();
    this.setTargetActivity(data);
    this.onModelChange(null, modelData);
  };
  function _updateBoxes(){
    _.each(this.dataRows, function(dr){
      dr.toggleEditView(true);
    });
  }

  function _onSave(saving){
    if(saving === 'saving'){
      this.saveNotice.textContent = 'Saving...';
    } else if(saving === 'unsaved') {
      this.saveNotice.textContent = 'Unsaved Changes';
    } else {
      this.saveNotice.textContent = 'All changes saved';
    }
  };

  function _insertAddButton(){
    this.addStep = this.addDiv(addStyle, 'Add Step', _onAddClick.bind(this));
  }

  function _onAddClick(){
    this.dispatcher.trigger('addActivity', this.targetActivityData.id);
    mixpanel.track('addStep');
  }

  function _onBackClick(){
    this.dispatcher.trigger('backToHome');
  }

  function _showDeleteConfirm(boxData){
    this.deletePopup.addOkay(function(){
      this.dispatcher.trigger('deleteActivity', boxData);
      this.dispatcher.trigger('backToHome');
      this.deletePopup.hide();
    }.bind(this), "left");
    this.deletePopup.show();
  }

  var addStyle = {
    fontFamily: 'Arial',
    height: 20,
    lineHeight: 20,
    fontSize: 16,
    color: '#434343',
    backgroundColor: '#eee',
    border: '1px solid #888',
    borderTop: 0,
    width: 100,
    marginRight: 40,
    cssFloat: 'right',
    marginBottom: 20,
    textAlign: 'center',
    cursor: 'pointer',
    display: 'inline-block',
  };

  var saveStyle = {
    position: 'absolute',
    right: 20,
    lineHeight: 60,
    fontSize: 16,
    color: App.DARK_BLUE
  };

  App.ActivityEditor = ActivityEditor;
}(App));