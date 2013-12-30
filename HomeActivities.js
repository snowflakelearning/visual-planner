/**
 * Created by Alex on 12/13/13.
 */
window.App = window.App || {};
(function(App){
  var HomeActivities = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = HomeActivities.prototype = new App.ActivityList();
  p.activityListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.activityListInitialize(parentNode, dispatcher);
    this.setHeaderTitle('My Activities');
    this.addRightHeaderButton('Create New', _onAdd.bind(this));
  };

  p.baseUpdate = p.update;
  p.update = function(data){
    var filter = _.filter(data, function(r){
      return r.parentId === null;
    });
    this.baseUpdate(filter);
  };

  function _onAdd(){
    if(window.navigator.onLine){
      this.dispatcher.trigger('addActivity', null);
      mixpanel.track('addActivityClick');
    } else {
      alert('Editing is disabled while you are offline.  If you would like us to add offline editing please ' +
          'let us know by emailing us at snowflake@alxgroup.net.');
    }
  }

  App.HomeActivities = HomeActivities;
}(App));