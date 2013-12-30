/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  var BACK_IMAGE = 'images/back-arrow.svg';

  var ActivityList = function(parentNode, dispatcher) {
    if(parentNode){
      this.initialize(parentNode, dispatcher);
    }
  };

  var p = ActivityList.prototype = new App.DataList();
  p.dataListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.dataListInitialize(parentNode, dispatcher);
    ALXUI.styleEl(this.listContainer, {width: App.BOX_WIDTH});
    ALXUI.styleEl(this.header, headerStyle);
    this.headerTitle = ALXUI.addDivTo(this.header, headerTextStyle);
    this.empty = new App.Empty(this.listContainer, this.dispatcher);
    this.dispatcher.bind('modelChange', this.onModelChange, this);
  };

  p.setHeaderTitle = function(text){
    this.headerTitle.textContent = text;
  };

  p.addRightHeaderButton = function(text, callback){
    return this.add = ALXUI.addDivTo(this.header, buttonStyle, text, callback);
  };

  p.addRow = function(rowData){
    var row = new App.ActivityRow(this.listContainer, this.dispatcher, rowData);
    this.dataRows.push(row);
    row.toggleEditView(this.editMode, this.targetActivityData);
  };

  p.setTargetActivity = function(data){
    this.targetActivityData = data;
  };

  p.filterToTargetActivity = function(data, includeParent){
    if(!this.targetActivityData){
      return data;
    }
    return _.filter(data, function(r){
      if(r.parentId === this.targetActivityData.id){
        return true;
      }
      if(includeParent && r.parentId === null && r.id === this.targetActivityData.id){
        return true;
      }
    }.bind(this));
  };

  p.onModelChange = function(model){
    this.update(model.getActivityData());
  };

  p.dataListUpdate = p.update;
  p.update = function(activityData) {
    if(activityData.length === 0){
      this.empty.show();
    } else {
      this.empty.hide();
    }
    _.each(activityData, function(a){
      if(a.parentId !== null){
        a.listId = a.parentId + ',' + a.id;
      } else {
        a.listId = a.id;
      }
    });
    this.dataListUpdate(activityData, 'listId', true);
  };

  p.getActivityData = function(){
    var res = [];
    _.each(this.dataRows, function(r){
      res.push(r.getInputData());
    });
    return res;
  };

  p.addBackButton = function(callback){
    this.back = ALXUI.addDivTo(this.header, backStyle, null, callback);
    return this.back;
  };

  p.addBackText = function(){
    this.backText = ALXUI.addDivTo(this.header, backTextStyle);
    return this.backText;
  };

  var backTextStyle = {
    cssFloat: 'left',
    marginLeft: 10,
    lineHeight: 59,
  };

  var headerStyle = {
    width: App.BOX_WIDTH,
    height: 59,
    color: '#434343',
    backgroundColor: '#ddd',
    fontSize: 22,
    lineHeight: 59,
    borderBottom: 'solid 1px #aaa',
    position: 'relative'
  };

  var headerTextStyle = {
    position: 'absolute',
    width: '100%',
  };

  var backStyle = {
    cssFloat: 'left',
    marginTop: 15,
    height: 30,
    width: 30,
    backgroundImage: 'url(' + BACK_IMAGE + ')',
    marginLeft: 20,
    cursor: 'pointer'
  };

  var buttonStyle = {
    width: 140,
    height: 30,
    backgroundColor:App.DARK_BLUE,
    color: 'white',
    textAlign: 'center',
    borderRadius: 3,
    fontSize: 16,
    lineHeight: 30,
    cursor: 'pointer',
    position: 'absolute',
    top: 15,
    right: 25,
  };

  App.ActivityList = ActivityList;
}(App));