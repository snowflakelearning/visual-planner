var App = App || {};
(function(App) {

  var SAVE_CHUNK_TIME = 1000;

  App.BLANK_IMAGE_URL = 'images/help-browser.svg';
  App.BLANK_IMAGE_TAG = 'BLANK';

  var blankActivity = {
    "id": 0,
    "parentId": null,
    "name": "",
    "when": "",
    "who": [],
    "where": App.BLANK_IMAGE_TAG,
    "icon": App.BLANK_IMAGE_TAG
  };

  var VisualPlanner = function(div, am, dispatcher) {
    this.initialize(div, am, dispatcher);
  };

  var p = VisualPlanner.prototype;
  p.initialize = function(div, am, dispatcher){
    this.am = am;
    this.div = ALXUI.addEl(div, 'div', containerStyle);
    this.dispatcher = dispatcher;
    this.header = new App.Header(this.div, this.dispatcher);
    this.content = ALXUI.addEl(this.div, 'div');
    this.list = new App.ActivityList(this.content, this.dispatcher);
    this.detailView = new App.DetailView(this.content, this.dispatcher);
    this.dispatcher.bind('activityEdit', _editActivity, this);
    this.dispatcher.bind('showImagePopup', _showImagePopup, this);
    this.imageSelectPopup = new App.ImageGallery(document.body, _.extend({}, Backbone.Events), am);
    this.imageSelectPopup.toPopupMode();
    this.dispatcher.bind('showActivityDetail', _showDetailView, this);
    this.dispatcher.bind('exitDetailView', _hideDetailView, this);
    this.dispatcher.bind('editMode', _hideDetailView, this);
    this.dispatcher.bind('addActivity', _addActivity, this);
    this.dispatcher.bind('deleteActivity', _deleteActivity, this);
    this.activityData = {};
    App.css.fixWidth(this.content, App.BOX_WIDTH);
    this.firstRun = true;
    this.dispatcher.trigger('editMode', true);
    ALXUI.hide(this.list.div);
    this.dispatcher.bind('showIntro', _showIntro, this);
  };

  p.load = function(){
    this.am.getUserImages(this.fetchData.bind(this), err.bind(this));
  };

  p.openData = function(activityJson) {
    this.activityData = activityJson;
    if(this.firstRun && activityJson.length === 0){
      this.dispatcher.trigger('addActivity', null);
      if(this.am.newUser || true){  ///TODO DEBUG
        this.dispatcher.trigger('showIntro', 'Edit');
      }
    } else {
      this.list.update(this.activityData);
      this.dispatcher.trigger('editMode', false);
      if(this.firstRun){
        ALXUI.show(this.list.div);
        this.firstRun = false;
      }
    }
  };

  p.saveData = function(data){
    if(data){
      this.activityData = data;
      this.list.update(this.activityData);
    }
    clearTimeout(this.saveTO);
    this.saveTO = setTimeout(function(){
      this.am.pushActivityData(this.activityData);
    }.bind(this), SAVE_CHUNK_TIME);
  };

  p.fetchData = function(){
    this.am.fetchActivityData(this.openData.bind(this), _noData.bind(this));
  };

  function _showIntro(introName){
    //App.IntroManager.playIntro(introName, this);
    //var cs = new App.CanvasShader();
    //cs.shadeEl(this.header.title);
  }

  function _noData(){
    this.openData([]);
  };

  function err(err){
    console.log(err);
    alert('Unable to load account data, please check your internet connection.');
  }

  function _deleteActivity(data){
    var activityData = this.list.getActivityData();
    var match;
    activityData = _.reject(activityData, function(a){
      return (a.id === data.id && a.parentId == data.parentId) ||
          (a.parentId === data.id && data.parentId === null);
    });
    this.saveData(activityData);
  }

  function _addActivity(parentId){
    this.dispatcher.trigger('editMode', true);
    var activityData = this.list.getActivityData();
    var newActivity = _createBlankActivityJson.apply(this, [activityData, parentId]);
    activityData.push(newActivity);
    if(newActivity.parentId === null){
      var newStep = _createBlankActivityJson.apply(this, [activityData, newActivity.id])
      activityData.push(newStep);
    }
    this.saveData(activityData);
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
    }
    return newActivity;
  }

  function _showDetailView(data){
    var activityData = this.list.getActivityData();
    var rowData = _.filter(activityData, function(r){
      return r.parentId === data.id;
    });
    this.detailView.show(rowData, data.name);
    ALXUI.hide(this.list.div);
  }

  function _hideDetailView(){
    this.detailView.hide();
    ALXUI.show(this.list.div);
  }

  function _showImagePopup(row, attribute, e){
    mixpanel.track('showImagePopup', {action: attribute + 'Edit'});
    this.imageSelectPopup.show(e, function(data){
      mixpanel.track('activityEdit', {action: attribute + 'Edit'});
      row.data[attribute] = data;
      _editActivity.apply(this, [row.data]);
    }.bind(this), attribute === 'who', row.data[attribute]);
  }

  function _editActivity(rowData){
    clearTimeout(this.editTo);
    this.editTo = setTimeout(function(){
      var activityData = this.list.getActivityData();
      var row = _.find(activityData, function(r){
            return r.id === rowData.id && r.parentId === rowData.parentId;
      });
      for(var x in row){
        row[x] = rowData[x];
      }
      this.saveData(activityData);
    }.bind(this), 1000);
  }

  function _setupIntro(){
    return;
    App.IntroManager.initialize();
    App.IntroManager.addIntroStep('test', this.header.preview, 'Click here to enter edit mode', 'left');
    App.IntroManager.addIntroStep('test', document.querySelector('.uv-icon'),
          'If you have any feedback click here to let us know', 'top');
    App.IntroManager.playIntro('test');
  }

  var containerStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'white',
    userSelect: 'none',
    mozUserSelect: 'none',
    webkitUserSelect: 'none',
    msUserSelect: 'none',
    position: 'absolute',
    overflowX: 'hidden',
    minWidth: 768,
  };

  App.VisualPlanner = VisualPlanner;
}(App));