/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  var ActivityList = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = ActivityList.prototype = new App.DataList();
  p.dataListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.dataListInitialize(parentNode, dispatcher);
    this.addButtons = {};
    this.dispatcher.bind('editMode', _onEditToggle, this);
    ALXUI.styleEl(this.listContainer, {width: App.BOX_WIDTH});
    ALXUI.styleEl(this.header, headerStyle);
    this.headerTitle = ALXUI.addEl(this.header, 'div', headerTextStyle);
    this.headerTitle.textContent = 'My Activities';
    this.preview = ALXUI.addEl(this.header, 'div', buttonStyle);
    this.preview.textContent = 'Edit';
    this.add = ALXUI.addEl(this.header, 'div', [buttonStyle, {right: 100, display: 'none'}]);
    this.add.textContent = 'Add';
    App.css.addTouchClickEvent(this.add, _onAdd, this);
    App.css.addTouchClickEvent(this.preview, _onPreview, this);
    this.dispatcher.bind('editMode', _onEditMode, this);
    this.saveNotice = ALXUI.addEl(this.header, 'div', saveStyle);
    this.saveNotice.textContent = 'All changes saved';
    this.dispatcher.bind('save', _onSave, this);
    this.empty = new App.Empty(this.listContainer, this.dispatcher);
  };

  p.addRow = function(rowData){
    var row = new App.ActivityRow(this.listContainer, this.dispatcher, rowData);
    this.dataRows.push(row);
    row.toggleEditView(this.editMode);
    if(rowData.parentId === null){
      this.listContainer.appendChild(row.div);
      _insertAddButton.apply(this, [rowData.id]);
    } else {
      this.listContainer.insertBefore(row.div, this.addButtons[rowData.parentId]);
    }
  };

  p.dataListRemoveRow = p.removeRow;
  p.removeRow = function(row){
    if(row.data.parentId === null){
      this.listContainer.removeChild(this.addButtons[row.data.id]);
      delete this.addButtons[row.data.id];
    }
    this.dataListRemoveRow(row);
  };

  p.dataListUpdate = p.update;
  p.update = function(activityData) {
    if(activityData.length === 0){
      this.empty.show();
    } else {
      this.empty.hide();
    }
    var clone = JSON.parse(JSON.stringify(activityData));
    _.each(clone, function(a){
      if(a.parentId !== null){
        a.listId = a.parentId + ',' + a.id;
      } else {
        a.listId = a.id;
      }
    });
    this.dataListUpdate(clone, 'listId', true);
  };

  p.hideAddSteps = function(){
    for(var i = 0; i < this.addButtons.length; i++){
      ALXUI.hide(this.addButtons[i]);
    }
  };

  p.getActivityData = function(){
    var res = [];
    _.each(this.dataRows, function(r){
      res.push(r.getInputData());
    });
    return res;
  };

  function _onEditToggle(on){
    this.editMode = on;
    if(on){
      this.headerTitle.textContent = 'Activity Editor';
    } else {
      this.headerTitle.textContent = 'My Activities';
    }
    for(var x in this.addButtons){
      if(on){
        ALXUI.show(this.addButtons[x]);
      } else {
        ALXUI.hide(this.addButtons[x]);
      }
    }
  }

  function _onAdd(){
    this.dispatcher.trigger('addActivity', null);
    mixpanel.track('addActivityClick');
  }

  function _onEditMode(on){
    this.previewing = !on;
    if(this.previewing){
      this.preview.textContent = 'Edit';
      ALXUI.hide(this.saveNotice);
      ALXUI.hide(this.add);
    } else {
      this.preview.textContent = 'View';
      ALXUI.show(this.add);
      ALXUI.show(this.saveNotice);
    }
  }

  function _onPreview(){
    this.previewing = !this.previewing;
    this.dispatcher.trigger('editMode', !this.previewing);
    if(this.previewing){
      mixpanel.track('previewClick');
    } else {
      mixpanel.track('editClick')
    }
  }

  function _insertAddButton(parentId){
    var addButton = ALXUI.createEl('div', addStyle);
    this.addButtons[parentId] = addButton;
    addButton.textContent = 'Add Step';
    var parentRow = _.find(this.dataRows, function(r){
      return r.data.id === parentId && r.data.parentId === null;
    });
    var nextParentRow = null;
    var parentChildIndex = Array.prototype.indexOf.call(this.listContainer.childNodes, parentRow.div);
    for(var i = parentChildIndex + 1; i < this.listContainer.childNodes.length; i++){
      var row = _.find(this.dataRows, function(r){
        return r.div === this.listContainer.childNodes[i];
      }.bind(this));
      if(row && row.data.parentId === null){
        nextParentRow = row;
        break;
      }
    }
    if(nextParentRow){
      this.listContainer.insertBefore(addButton, nextParentRow.div);
    } else {
      this.listContainer.appendChild(addButton);
    }
    App.css.addTouchClickEvent(addButton, _createAddClick.apply(this,[parentId]));
  }

  function _createAddClick(parentId){
    return function(){
      this.dispatcher.trigger('addActivity', parentId);
      mixpanel.track('addStep');
    }.bind(this);
  }

  function _onSave(saving){
    if(saving){
      this.saveNotice.textContent = 'Saving...';
    } else {
      this.saveNotice.textContent = 'All changes saved';
    }
  };

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
    marginTop: -4,
  };

  var headerStyle = {
    width: App.BOX_WIDTH,
    height: 39,
    color: '#434343',
    backgroundColor: '#ddd',
    fontSize: 20,
    lineHeight: 40,
    borderBottom: 'solid 1px #aaa',
    position: 'relative'
  };

  var buttonStyle = {
    width: 80,
    height: 30,
    backgroundColor:App.DARK_BLUE,
    color: 'white',
    textAlign: 'center',
    borderRadius: 3,
    fontSize: 16,
    lineHeight: 30,
    cursor: 'pointer',
    position: 'absolute',
    top: 5,
    right: 5,
  };

  var headerTextStyle = {
    position: 'absolute',
    width: '100%',
  };

  var saveStyle = {
    position: 'absolute',
    left: 20,
    lineHeight: 40,
    fontSize: 16,
    color: App.DARK_BLUE
  };

  App.ActivityList = ActivityList;
}(App));