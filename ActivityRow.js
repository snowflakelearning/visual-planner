/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  App.BOX_WIDTH = 1024;

  var ARROW_IMAGE = 'images/up-arrow.svg';
  var HIDE_ICON = 'images/hide-bar.svg';
  var im = ALXUI.createEl('img');
  im.src = HIDE_ICON;

  var ActivityRow = function(parentNode, dispatcher, data) {
    this.initialize(parentNode, dispatcher, data);
  };

  var p = ActivityRow.prototype = new App.DataRow();
  p.listBoxInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher, data) {
    this.parentNode = parentNode;
    this.listBoxInitialize(parentNode, dispatcher, data);
    this.addHeader();
    this.addDescription();
    this.addThumb();
    this.rightContainer = ALXUI.addEl(this.div, 'div',
        rightContainerStyle);
    ALXUI.styleEl(this.div, boxStyle);
    ALXUI.styleEl(this.thumb, thumbStyle);
    ALXUI.styleEl(this.header, headerStyle);
    this.rightContainer.appendChild(this.header);
    this.rightContainer.appendChild(this.description);
    this.whoWhereContainer = ALXUI.addEl(this.rightContainer, 'div',
        whoWhereStyle);
    ALXUI.styleEl(this.description, descStyle);
    _addWho.apply(this);
    _addWhere.apply(this);
    _addDetailsButton.apply(this);
    _addInputs.apply(this);
    this.dispatcher.bind('editMode', this.toggleEditView, this);
    this.dispatcher.bind('delete', function(toDelete){
      if(toDelete === this){
        _onDelete.apply(this);
      }
    }, this);
    _addHideStep.apply(this);
  };

  p.addHeader = function(){
    this.header = ALXUI.addEl(this.div, 'div', headerStyle);
  };

  p.addDescription = function(){
    this.description = ALXUI.addEl(this.div, 'div', descStyle);
  };

  p.addThumb = function(){
    this.thumb = ALXUI.addEl(this.div, 'div', thumbStyle);
  };

  p.dataRowUpdate = p.update;
  p.update = function(data, num){
    this.dataRowUpdate(data);
    this.header.textContent = data.name;
    if(data.when){
      this.description.textContent = 'When: ' + data.when;
      this.whenInput.input.value = data.when;
    }
    if(data.parentId !== null){
      ALXUI.setBackgroundImage(this.thumb, this.data.where);
      this.header.textContent = (num + 1) + '. ' + data.name;
      ALXUI.show(this.hide);
      //ALXUI.show(this.whereInput.div);
      ALXUI.show(this.whoInput.div);
    } else {
      ALXUI.hide(this.hide);
      ALXUI.hide(this.whereInput.div);
      ALXUI.hide(this.whoInput.div);
      ALXUI.setBackgroundImage(this.thumb, this.data.icon);
      ALXUI.setBackgroundImage(this.whereThumb, this.data.where);
      ALXUI.styleEl(this.div, {backgroundColor: 'white'});
      ALXUI.hide(this.arrowContainer);
    }
    this.whoThumbContainer.populate(this.data.who);

    this.nameInput.input.value = data.name;
    this.whereInput.input.value = App.getImageData(data.where).text;
    var whoNames = [];
    _.each(data.who, function(p){
      whoNames.push(App.getImageData(p).text);
    });
    this.whoInput.input.value = whoNames.join(', ');
  };

  p.goDetailView = function(){
    ALXUI.setBackgroundImage(this.thumb, this.data.where);
    ALXUI.hide(this.detailsButton);
    ALXUI.hide(this.whereContainer);
    ALXUI.styleEl(this.div, {width: 1022, margin: 0, border: 0, borderBottom: "solid 1px #ccc"});
    ALXUI.styleEl(this.description, {lineHeight: null, height: null});
    ALXUI.styleEl(this.header, {fontSize: 24})
    ALXUI.styleEl(this.whoContainer, {width: '100%'});
    ALXUI.hide(this.whenInput.div);
  };

  p.toggleEditView = function(on){
    var editMainStyle = {
      width: App.BOX_WIDTH - 50,
      marginLeft: 25,
      height: 100,
      border: 'solid 1px #888',
      marginTop: 10,
    };
    var editThumbStyle = {
      width: 90,
      height: 90,
      margin: 5,
      cursor: 'pointer',
    };
    var editDetailStyle = {
      width: App.BOX_WIDTH - 150,
      marginLeft: 125,
      display: 'block',
      marginTop: 0,
    }
    if(on){
      ALXUI.styleEl(this.div, editMainStyle);
      ALXUI.styleEl(this.thumb, editThumbStyle);
      ALXUI.hide(this.header);
      ALXUI.hide(this.rightContainer);
      ALXUI.show(this.inputContainer);
      if(this.data.parentId !== null){
        ALXUI.styleEl(this.div, editDetailStyle);
        ALXUI.hide(this.whereInput.div);
      }
    } else {
      ALXUI.styleEl(this.div, boxStyle);
      ALXUI.styleEl(this.thumb, thumbStyle);
      ALXUI.show(this.header);
      ALXUI.show(this.rightContainer);
      ALXUI.hide(this.inputContainer);
      if(this.data.parentId !== null){
        ALXUI.hide(this.div);
      } else {
        ALXUI.hide(this.whoWhereContainer);
      }
    }
    this.editMode = on;
  };

  p.getInputData = function(){
    var data = JSON.parse(JSON.stringify(this.data));
    delete data.listId;
    return data;
  };

  function _addInputs(){
    this.inputContainer = ALXUI.addEl(this.div, 'div',
        inputContainerStyle);
    this.addCloser();
    ALXUI.styleEl(this.closer, {marginTop: -15});
    this.inputContainer.appendChild(this.closer);
    this.nameInput = new App.LabeledInput(this.inputContainer,
        'What', 'Describe the activity');
    this.whoInput = new App.LabeledInput(this.inputContainer, 'Who',
        'Click to select photos for who will be there');
    this.whenInput = new App.LabeledInput(this.inputContainer, 'When',
        'eg "Thursday at 4pm"');
    this.whereInput = new App.LabeledInput(this.inputContainer, 'Where',
        'Click to select a picture');
    this.whoInput.input.readOnly = true;
    this.whereInput.input.readOnly = true;
    this.nameInput.input.addEventListener('input', _onInput.bind(this));
    this.whenInput.input.addEventListener('input', _onInput.bind(this));
    App.css.addTouchClickEvent(this.whoInput.input, _showWhoPopup, this);
    App.css.addTouchClickEvent(this.whereInput.input, _showWherePopup, this);
    App.css.addTouchClickEvent(this.thumb, _showThumbPopup, this);
    this.arrowContainer = ALXUI.addEl(this.inputContainer, 'div', arrowContainerStyle);
    this.upArrow = ALXUI.addEl(this.arrowContainer, 'div', arrowStyle);
    this.downArrow = ALXUI.addEl(this.arrowContainer, 'div', [arrowStyle, {top: 50}]);
    ALXUI.setBackgroundImage(this.upArrow, ARROW_IMAGE);
    ALXUI.setBackgroundImage(this.downArrow, ARROW_IMAGE);
    App.css.setScaleTransform(this.downArrow, 1, -1);
    App.css.addTouchClickEvent(this.upArrow, function(){
      this.dispatcher.trigger('shiftStep', true, this.data.id, this.data.parentId)
    }.bind(this));
    App.css.addTouchClickEvent(this.downArrow, function(){
      this.dispatcher.trigger('shiftStep', false, this.data.id, this.data.parentId)
    }.bind(this));
  }

  function _updateFromInput(){
    this.data.name = this.nameInput.input.value;
    this.data.when = this.whenInput.input.value;
    this.update(this.data);
  }

  function _addHideStep(){
    this.hide = ALXUI.addEl(this.rightContainer, 'div', hideStyle);
    ALXUI.setBackgroundImage(this.hide, HIDE_ICON);
    this.hide.title = 'Hide this step temporarily';
    App.css.addTouchClickEvent(this.hide, function(){
      ALXUI.hide(this.div);
      this.hidden = true;
      this.dispatcher.trigger('hideStep');
      mixpanel.track('hideStep')
    }.bind(this));
    if(this.data.parentId !== null){
      this.dispatcher.bind('showAllSteps', function(){
        this.hidden = false;
      }.bind(this));
    }
  }

  function _onDelete(){
    this.dispatcher.trigger('deleteActivity', this.getInputData());
    if(this.data.parentId === null){
      mixpanel.track('activityDelete')
    } else {
      mixpanel.track('stepDelete');
    }
  }

  function _onInput(e){
    if(e.target === this.nameInput.input){
      mixpanel.track('activityEdit', {action: 'nameEdit'});
    } else if(e.target === this.whenInput.input){
      mixpanel.track('activityEdit', {action: 'whenEdit'});
    }

    _updateFromInput.apply(this);
    var data = this.getInputData();
    this.dispatcher.trigger('activityEdit', data);
  }

  function _showWherePopup(e){
    this.dispatcher.trigger('showImagePopup', this, 'where', e);
  }

  function _showWhoPopup(e){
    this.dispatcher.trigger('showImagePopup', this, 'who', e);
  }

  function _showThumbPopup(e){
    if(!this.editMode){
      return;
    }
    if(this.data.parentId !== null){
      this.dispatcher.trigger('showImagePopup', this, 'where', e);
    } else {
      this.dispatcher.trigger('showImagePopup', this, 'icon', e);
    }
  }

  function _addWho(){
    this.whoContainer = ALXUI.addEl(this.whoWhereContainer, 'div',
        whoContainerStyle);
    this.whoThumbContainer = new App.WhoPopup(this.whoContainer, this.dispatcher, this.parentNode);
    this.whoThumbContainer.populate(this.data.who)
  }

  function _addWhere(){
    this.whereContainer = ALXUI.addEl(this.whoWhereContainer, 'div',
        whereContainerStyle);
    this.whereText = ALXUI.addEl(this.whereContainer, 'div',
        whereTextStyle);
    this.whereText.textContent = 'at';
    this.whereThumb = ALXUI.addEl(this.whereContainer, 'div', whereThumbStyle);
    ALXUI.setBackgroundImage(this.whereThumb, this.data.where);
  }

  function _addDetailsButton(){
    this.detailsButton = ALXUI.addEl(this.rightContainer, 'div',
        detailsButtonStyle);
    App.css.addTouchClickEvent(this.detailsButton, _showDetails, this);
    this.detailsButton.textContent = 'View';
  }

  function _showDetails(e){
    this.dispatcher.trigger('showActivityDetail', this.data);
    mixpanel.track('showDetailView');
  };

  var inputContainerStyle = {
    width: App.css.generateBrowserCalcString('100% - 100px'),
    height: 70,
    cssFloat: 'left',
    marginTop: 15,
  };

  var detailsButtonStyle = {
    width: 120,
    margin: 'auto',
    height: 35,
    backgroundColor: App.DARK_BLUE,
    textAlign: 'center',
    fontSize: 22,
    color: 'white',
    lineHeight: 35,
    cursor: 'pointer',
    borderRadius: 3,
  };

  var whoWhereStyle = {
  };

  var whereTextStyle = {
    cssFloat: 'left',
    lineHeight: 200,
    color: '#888',
    fontFamily: 'Arial',
    fontStyle: 'italic',
    fontSize: 24,
  };

  var whereThumbStyle = {
    display: 'inline-block',
    cssFloat: 'left',
    width: 150,
    height: 150,
    margin: 5,
    textAlign: 'center',
    marginTop: 25,
  };

  var whereContainerStyle = {
    display: 'inline-table',
    height: 200,
    overflow: 'auto',
    textAlign: 'center',
  };

  var boxStyle = {
    height: 200,
    fontFamily: 'arial',
    display: 'inline-block',
    border: 0,
    margin: 4,
    width: App.BOX_WIDTH/2 - 10,
    border: 'solid 1px #888',
    position: 'relative',
  };

  var headerStyle = {
    marginTop: 18,
    fontSize: 24,
    textAlign: 'center',
    maxWidth: '100%',
    width: '100%',
    display: 'block',
    maxHeight: 60,
    lineHeight: 30,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  };

  var descStyle = {
    fontSize: 18,
    textAlign: 'center',
    margin: 0,
    width: '100%',
    height: 68,
    lineHeight: 68,
    color: '#88a',
  };

  var rightContainerStyle = {
    position: 'relative',
    width: App.css.generateBrowserCalcString('100% - 220px'),
    height: '100%',
    cssFloat: 'left',
    marginLeft: 5,
  }

  var thumbStyle = {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 5,
    height: App.css.generateBrowserCalcString('100% - 40px'),
    width: 180,
    boxShadow: 'rgba(50, 50, 50, 0.498039) 0px 3px 10px',
    cursor: 'default',
    cssFloat: 'left',
  };

  var whoContainerStyle = {
    textAlign: 'center',
    marginTop: 10,
  };

  var hideStyle = {
    width: 32,
    height: 32,
    position: 'absolute',
    right: 0,
    top: 8,
    cursor: 'pointer',
    backgroundColor: '#ddd',
    borderRadius: 3,
  };

  var arrowContainerStyle = {
    height: 80,
    left: -35,
    top: 10,
    width: 30,
    position: 'absolute',
  };

  var arrowStyle = {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 0,
  };

  App.ActivityRow = ActivityRow;
}(App));