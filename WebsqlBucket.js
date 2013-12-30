/**
 * Created by Alex on 12/4/13.
 */
window.App = window.App || {};
(function(App){
  var WebsqlBucket = function(dispatcher) {
    this.initialize(dispatcher);
  };

  var p = WebsqlBucket.prototype = new App.WebsqlDB();
  p.websqlDBInitialize = p.initialize;
  p.initialize = function(dispatcher) {
    this.websqlDBInitialize(dispatcher);
  };

  p.getObject = function(params, callback){
    var key = params.Key;
    var fields = key.split('/');
    var attr;
    if(fields[2] === 'activityData' && fields[0] === 'json'){
      attr = 'activityJson';
    }
    var id = fields[1];
    this.getItem({TableName: 'Users', Key: {id: {'S': id}}}, function(err, data){
      if(err){
        console.log('websql get object error');
        console.dir(err);
        callback(err);
      } else {
        var result = {Body:{}};
        if(data){
          for(var i = 0; i < data.Item[attr].S.length; i++){
            result.Body[i] = data.Item[attr].S.charCodeAt(i);
          }
        }
        callback(null, result);
      }
    });
  };

  App.WebsqlBucket = WebsqlBucket;
}(App));
