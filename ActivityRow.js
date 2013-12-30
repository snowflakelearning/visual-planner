/**
 * Created by Alex on 11/12/13.
 */
window.App = window.App || {};
(function(App){

  App.BOX_WIDTH = 1024;

  var ARROW_IMAGE = 'images/up-arrow.svg';
  var HIDE_ICON = 'images/checkmark.svg';

  var ActivityRow = function(parentNode, dispatcher, data) {
    this.initialize(parentNode, dispatcher, data);
  };

  var p = ActivityRow.prototype = new App.DataRow();
  p.dataRowInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher, data) {
    this.parentNode = parentNode;
    this.dataRowInitialize(parentNode, dispatcher, data, boxStyle);
    this.editMode = false;
    this.addThumb();
    this.rightContainer = this.addDiv(rightContainerStyle);
    this.addHeader();
    this.addDescription();
    this.whoWhereContainer = ALXUI.addEl(this.rightContainer, 'div',
        whoWhereStyle);
    _addWhere.apply(this);
    _addDetailsButton.apply(this);
    _addEditButton.apply(this);
    _addInputs.apply(this);
    _addHideStep.apply(this);
    this.dispatcher.bind('imageDataChange', _updateWhoNames, this);
    if(_isBlankData.apply(this, [data])){
      ALXUI.setGreyInstructionStyle(this.nameInput.input);
      ALXUI.setGreyInstructionStyle(this.whenInput.input);
    }
  };

  p.addHeader = function(){
    this.header = ALXUI.addDivTo(this.rightContainer, headerStyle);
  };

  p.addDescription = function(){
    this.description = ALXUI.addDivTo(this.rightContainer, descStyle);
  };

  p.addThumb = function(){
    this.thumb = this.addDiv(thumbStyle);
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
      ALXUI.show(this.hider);
      ALXUI.show(this.whoInput.div);
    } else {
      ALXUI.hide(this.hider);
      ALXUI.hide(this.whereInput.div);
      ALXUI.hide(this.whoInput.div);
      ALXUI.setBackgroundImage(this.thumb, this.data.icon);
      ALXUI.setBackgroundImage(this.whereThumb, this.data.where);
      ALXUI.styleEl(this.div, {backgroundColor: 'white'});
      ALXUI.hide(this.arrowContainer);
    }
    if(this.whoThumbContainer){
      this.whoThumbContainer.update(this.data.who);
    }
    if(this.nameInput.input.value !== data.name){
      this.nameInput.input.value = data.name;
    }
    if(this.whenInput.input.value !== App.getImageData(data.where).text){
      this.whereInput.input.value = App.getImageData(data.where).text;
    }
    _updateWhoNames.apply(this);
  };

  p.goDetailView = function(){
    if(!this.whoContainer){
      _addWho.apply(this);
      this.whoThumbContainer.update(this.data.who);
    }
    ALXUI.setBackgroundImage(this.thumb, this.data.where);
    ALXUI.hide(this.detailsButton);
    ALXUI.hide(this.editButton);
    ALXUI.hide(this.whereContainer);
    ALXUI.styleEl(this.div, {width: 1022, margin: 0, border: 0, borderBottom: "solid 1px #ccc"});
    ALXUI.styleEl(this.description, {lineHeight: null, height: null});
    ALXUI.styleEl(this.header, {fontSize: 24});
    ALXUI.styleEl(this.whoContainer, {width: '100%'});
    ALXUI.styleEl(this.thumb, {cursor: 'default'});
    ALXUI.hide(this.whenInput.div);
    this.detailMode = true;
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
        this.hide();
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
    this.inputContainer = this.addDiv(inputContainerStyle);
    this.addCloser(this.inputContainer, {marginTop: -15}, _onDelete.bind(this));
    this.nameInput = new App.LabeledInput(this.inputContainer,
        'What', 'Describe the activity', _onInput.bind(this));
    this.whoInput = new App.LabeledInput(this.inputContainer, 'Who',
        'Click to select photos for who will be there', null, _showWhoPopup.bind(this));
    this.whenInput = new App.LabeledInput(this.inputContainer, 'When',
        'eg "Thursday at 4pm"', _onInput.bind(this));
    this.whereInput = new App.LabeledInput(this.inputContainer, 'Where',
        'Click to select a picture', null, _showWherePopup.bind(this));
    this.whoInput.input.readOnly = true;
    this.whereInput.input.readOnly = true;
    App.css.addTouchClickEvent(this.thumb, _onThumbClick, this);
    this.arrowContainer = ALXUI.addDivTo(this.inputContainer, arrowContainerStyle);
    this.upArrow = ALXUI.addDivTo(this.arrowContainer, arrowStyle, null, function(){
      this.dispatcher.trigger('shiftStep', true, this.data.id, this.data.parentId)
    }.bind(this));
    this.downArrow = ALXUI.addDivTo(this.arrowContainer, [arrowStyle, {top: 50}], null, function(){
      this.dispatcher.trigger('shiftStep', false, this.data.id, this.data.parentId)
    }.bind(this));
    ALXUI.setBackgroundImage(this.upArrow, ARROW_IMAGE);
    ALXUI.setBackgroundImage(this.downArrow, ARROW_IMAGE);
    App.css.setScaleTransform(this.downArrow, 1, -1);
  }

  function _updateFromInput(){
    this.data.name = this.nameInput.input.value;
    this.data.when = this.whenInput.input.value;
  }

  function _addHideStep(){
    this.hider = ALXUI.addDivTo(this.rightContainer, hideStyle, '', function(){
      this.hide();
      this.hidden = true;
      this.dispatcher.trigger('hideStep');
      mixpanel.track('hideStep')
    }.bind(this));
    this.hider.title = 'Hide this step temporarily';
    var hideIcon = ALXUI.addDivTo(this.hider, hideIconStyle);
    ALXUI.setBackgroundImage(hideIcon, HIDE_ICON);
    if(this.data.parentId !== null){
      this.dispatcher.bind('showAllSteps', function(){
        this.hidden = false;
      }.bind(this));
    }
  }

  function _onDelete(){
    if(this.data.parentId === null){
      this.dispatcher.trigger('showDeleteActivityConfirm', this.getInputData());
      mixpanel.track('activityDelete')
    } else {
      this.dispatcher.trigger('deleteActivity', this.getInputData());
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
    //not used
    //this.dispatcher.trigger('showImagePopup', this, 'where', e);
  }

  function _showWhoPopup(e){
    this.dispatcher.trigger('showImagePopup', this, 'who', e, "Who will be at \"" +
        this.data.name + "\"");
  }

  function _onThumbClick(e){
    if(!this.detailMode){
      if(this.data.parentId !== null){
        this.dispatcher.trigger('showImagePopup', this, 'where', e, "Choose an icon for \"" +
            this.data.name + "\"");
      } else {
        if(!this.editMode){
          _showDetails.apply(this);
        } else {
          this.dispatcher.trigger('showImagePopup', this, 'icon', e, "Choose an icon for \"" +
              this.data.name + "\"");
        }
      }
    }
  }

  function _addWho(){
    this.whoContainer = ALXUI.addDivTo(this.whoWhereContainer, whoContainerStyle);
    this.whoThumbContainer = new App.WhoGallery(this.whoContainer, this.dispatcher, this.parentNode);
  }

  function _addWhere(){
    this.whereContainer = ALXUI.addDivTo(this.whoWhereContainer, whereContainerStyle);
    this.whereText = ALXUI.addDivTo(this.whereContainer, whereTextStyle, 'at');
    this.whereThumb = ALXUI.addDivTo(this.whereContainer, whereThumbStyle);
    ALXUI.setBackgroundImage(this.whereThumb, this.data.where);
  }

  function _addDetailsButton(){
    this.detailsButton = ALXUI.addDivTo(this.rightContainer, detailsButtonStyle, 'View', _showDetails.bind(this));
  }

  function _addEditButton(){
    this.editButton = ALXUI.addDivTo(this.rightContainer, [detailsButtonStyle,
      editButtonStyle], 'Edit', _onEditClick.bind(this));
  }

  function _onEditClick(){
    if(!window.navigator.onLine){
      alert('Editing is disabled while you are offline.  If you would like us to add offline editing please ' +
          'let us know by emailing us at snowflake@alxgroup.net.');
      return;
    }
    this.dispatcher.trigger('showEditor', this.data);
    mixpanel.track('editClick')
  }

  function _showDetails(e){
    this.dispatcher.trigger('showActivityDetail', this.data);
    mixpanel.track('showDetailView');
  };

  function _updateWhoNames(){
    var whoNames = [];
    _.each(this.data.who, function(p){
      var text = App.getImageData(p).text
      whoNames.push(text);
    });
    this.whoInput.input.value = whoNames.join(', ');
  }

  function _isBlankData(data){
    return (data.parentId === null && (data.name === App.BLANK_ACTIVITY_NAME &&
        data.when === App.BLANK_ACTIVITY_WHEN)) || (data.parentId !== null &&
        data.name === App.BLANK_STEP_NAME && data.when === App.BLANK_ACTIVITY_WHEN);
  }

  var inputContainerStyle = {
    width: App.css.generateBrowserCalcString('100% - 100px'),
    height: 70,
    cssFloat: 'left',
    marginTop: 15,
  };

  var detailsButtonStyle = {
    width: 78,
    marginLeft: 30,
    cssFloat: 'left',
    height: 35,
    backgroundColor: App.DARK_BLUE,
    border: 'solid 1px #666666',
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
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    width: App.BOX_WIDTH/2 - 45,
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
    cursor: 'pointer',
    cssFloat: 'left',
  };

  var whoContainerStyle = {
    textAlign: 'center',
    marginTop: 10,
  };

  var hideStyle = {
    position: 'absolute',
    right: 20,
    top: 25,
    cursor: 'pointer',
    color: App.DARK_BLUE,
    fontSize: 16,
    borderRadius: 3,
    backgroundColor: "#efefef",
    border: "solid 1px #434343",
    width: 32,
    height: 32,
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

  var editButtonStyle = {
    backgroundColor: '#888',
  };

  var hideIconStyle = {
    position: 'absolute',
    left: 4,
    top: 2,
    width: 26,
    height: 28,
  };

  App.ActivityRow = ActivityRow;
}(App));