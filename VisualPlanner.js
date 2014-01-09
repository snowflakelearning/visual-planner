var App = App || {};
(function(App) {

  App.BLANK_IMAGE_URL = 'images/help-browser.svg';
  App.BLANK_IMAGE_TAG = 'BLANK';
  App.BLANK_ACTIVITY_NAME = "Something fun!";
  App.BLANK_ACTIVITY_WHEN = "Someday";
  App.BLANK_STEP_NAME = "The First Step";

  var blankActivity = {
    "id": 0,
    "parentId": null,
    "name": App.BLANK_ACTIVITY_NAME,
    "when": App.BLANK_ACTIVITY_WHEN,
    "who": [],
    "where": App.BLANK_IMAGE_TAG,
    "icon": App.BLANK_IMAGE_TAG
  };

  var VisualPlanner = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = VisualPlanner.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  var p = VisualPlanner.prototype;
  p.initialize = function(parentNode, dispatcher){
    this.baseInitialize(parentNode, dispatcher, containerStyle);
    this.model = new App.VPModel(dispatcher);
    this.hide();
    _registerEvents.apply(this);
    this.header = new App.Header(this.div, this.dispatcher);
    this.content = this.addDiv();
    this.homeList = new App.HomeActivities(this.content, this.dispatcher);
    this.detailView = new App.DetailView(this.content, this.dispatcher);
    this.activityEditor = new App.ActivityEditor(this.content, this.dispatcher);
    this.imageSelectPopup = new App.ImageGallery(document.body, this.dispatcher);
    this.imageSelectPopup.toPopupMode();
    this.audioManager = new App.AudioManager(document.body, this.dispatcher);
    this.animationManager = new App.AnimationManager(document.body, this.dispatcher);
    this.firstRun = true;
    this.homeList.hide();
    this.detailView.hide();
    this.activityEditor.hide();
    App.IntroManager.initialize(this.dispatcher);
    this.am = new App.AccountManager(dispatcher);
    this.ipadEditWarningShown = false;
  };

  p.openData = function() {
    if(!this.model.initialized){
      return;
    }
    this.show();
    this.dispatcher.trigger('loadingComplete');
    var activityJson = this.model.getActivityData();
    if(this.firstRun && activityJson.length == 0){
      this.dispatcher.trigger('addActivity', null, true);
      if(this.am.storageManager.newUser){
        this.dispatcher.trigger('showIntro', 'NewUser');
      }
    } else {
      if(this.firstRun){
        _showHome.apply(this);
        this.firstRun = false;
      }
    }
    this.dispatcher.trigger('load');
  };

  p.saveData = function(data){
    this.model.setActivityData(data);
    this.dispatcher.trigger('saveData', this.model);
  };

  function _registerEvents(){
    this.dispatcher.bind('activityEdit', _editActivity, this);
    this.dispatcher.bind('showImagePopup', _showImagePopup, this);
    this.dispatcher.bind('showActivityDetail', _showDetailView, this);
    this.dispatcher.bind('addActivity', _addActivity, this);
    this.dispatcher.bind('deleteActivity', _deleteActivity, this);
    this.dispatcher.bind('shiftStep', _shiftStep, this);
    this.dispatcher.bind('showIntro', _showIntro, this);
    this.dispatcher.bind('backToHome', _showHome, this);
    this.dispatcher.bind('showEditor', _showEditView, this);
    this.dispatcher.bind('modelChange', _onModelChange, this);
  }

  function _onModelChange(){
    this.openData(this.model.getActivityData());
  }

  function _showHome(){
    this.activityEditor.hide();
    this.detailView.hide();
    this.homeList.show();
    this.viewing = "home";
  }

  function _showIntro(introName){
    var data = this.model.getActivityData();
    if(introName){
      App.IntroManager.playIntro(introName, this);
    } else {
      if(this.viewing === "editor"){
        App.IntroManager.playIntro('Edit', this);
      } else if(this.viewing === "details"){
        App.IntroManager.playIntro('Detail', this);
      } else {
        App.IntroManager.playIntro('ActivityList', this);
      }
    }
  }

  function _shiftStep(up, id, parentId){
    var activityData = this.model.getActivityData();
    var clickedRow = _.find(activityData, function(r){
      return r.id === id && r.parentId === parentId;
    });
    var clickedRowIndex = activityData.indexOf(clickedRow);
    var toSwitchIndex;
    if(up){
      toSwitchIndex = -1;
      _.each(activityData, function(r){
        var rIndex = activityData.indexOf(r);
        if(r.parentId === parentId &&  rIndex < clickedRowIndex && rIndex > toSwitchIndex){
          toSwitchIndex = rIndex;
        }
      });
    } else {
      toSwitchIndex = activityData.length;
      _.each(activityData, function(r){
        var rIndex = activityData.indexOf(r);
        if(r.parentId === parentId && rIndex > clickedRowIndex && rIndex < toSwitchIndex){
          toSwitchIndex = rIndex;
        }
      });
    }
    if(toSwitchIndex > -1 && toSwitchIndex < activityData.length){
      var toSwitch = activityData[toSwitchIndex];
      activityData[toSwitchIndex] = clickedRow;
      activityData[clickedRowIndex] = toSwitch;
    }
    this.saveData(activityData);
  }

  function _deleteActivity(data){
    var activityData = this.model.getActivityData();
    var filter = _.filter(activityData, function(s){
      return s.parentId === data.parentId
    })
    if(data.parentId !== null && filter.length === 1){
      var find = filter[0];
      find.name = blankActivity.name;
      find.where = blankActivity.where;
      find.who = blankActivity.who;
      find.when = blankActivity.when;
    } else {
      activityData = _.reject(activityData, function(a){
        return (a.id === data.id && a.parentId == data.parentId) ||
            (a.parentId === data.id && data.parentId === null);
      });
    }
    this.saveData(activityData);
  }

  function _addActivity(parentId, silent){
    var activityData = this.model.getActivityData();
    var newActivity = _createBlankActivityJson.apply(this, [activityData, parentId]);
    activityData.push(newActivity);
    if(newActivity.parentId === null){
      var newStep = _createBlankActivityJson.apply(this, [activityData, newActivity.id])
      activityData.push(newStep);
    }
    this.saveData(activityData);
    if(newActivity.parentId === null && !silent){
      this.dispatcher.trigger('showEditor', newActivity);
    }
  }

  function _createBlankActivityJson(activityData, parentId){
    var nextID = 0;
    _.each(activityData, function(a){
      if(a.parentId === parentId){
        nextID = Math.max(nextID, a.id);
      }
    });
    var newActivity = JSON.parse(JSON.stringify(blankActivity));
    newActivity.id = ++nextID;
    newActivity.parentId = parentId;
    if(parentId !== null){
      delete newActivity.icon;
      newActivity.name = App.BLANK_STEP_NAME;
    }
    return newActivity;
  }

  function _showDetailView(data){
    this.detailView.show(data, this.model.getActivityData());
    this.homeList.hide();
    this.viewing = 'details';
  }

  function _showEditView(data){
    if(window.navigator.onLine){
      var ask = true;
      if(App.css.osIsIOS() && !this.ipadEditWarningShown){
        ask = confirm("The activity editor is not currently optimized for mobile devices so it may be a bit hard to use " +
            "on your phone or table.  For the best experience we recommend editing on your laptop or desktop.  Do you " +
            "want to try editing on your mobile device anyways?");
        this.ipadEditWarningShown = true;
      }
      if(ask){
        this.activityEditor.show(data, this.model.getActivityData());
        this.detailView.hide();
        this.homeList.hide();
        this.viewing = 'editor';
      }
    } else {
      alert('Editing is disabled while you are offline.  If you would like us to add offline editing please ' +
          'let us know by emailing us at snowflake@alxgroup.net.');
    }
  }

  function _showImagePopup(row, attribute, e, title){
    mixpanel.track('showImagePopup', {action: attribute + 'Edit'});
    this.imageSelectPopup.show(e, function(data){
      mixpanel.track('activityEdit', {action: attribute + 'Edit'});
      row.data[attribute] = data;
      _editActivity.apply(this, [row.data]);
    }.bind(this), attribute === 'who', row.data[attribute], title);
  }

  function _editActivity(rowData){
    var activityData = this.model.getActivityData();
    var row = _.find(activityData, function(r){
      return r.id === rowData.id && r.parentId === rowData.parentId;
    });
    for(var x in rowData){
      row[x] = rowData[x];
    }
    this.saveData(activityData);
  }

  var containerStyle = {
    backgroundColor: 'white',
    userSelect: 'none',
    mozUserSelect: 'none',
    webkitUserSelect: 'none',
    msUserSelect: 'none',
    width: App.BOX_WIDTH,
  };

  App.VisualPlanner = VisualPlanner;
}(App));