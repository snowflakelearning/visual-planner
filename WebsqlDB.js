/**
 * Created by Alex on 12/4/13.
 */
window.App = window.App || {};
(function(App){

  var quotedAttributes = ['id', 'email', 'name', 'dev'];

  var WebsqlDB = function(dispatcher) {
    if(dispatcher){
      this.initialize(dispatcher);
    }
  };

  var p = WebsqlDB.prototype;
  p.initialize = function(dispatcher) {
    this.dispatcher = dispatcher;
    this.db = openDatabase('vpOffline', '1.0', 'vp activity and image data', 4*1024*1024);
    this.db.transaction(function (tx){
      tx.executeSql('CREATE TABLE IF NOT EXISTS Users (id unique, email, name, imageData, activityJson, dev)', []);
    }, function(err){
      console.log('unable to create table');
      console.dir(err);
    });
  };

  p.getItem = function(params, callback){
    var id = params.Key.id.S;
    var resp = {};
    this.db.transaction(function(tx){
      //websql doesn't let you wild card in table names it seems?
      tx.executeSql('SELECT * FROM ' + params.TableName + '', [], function(tx, res){
        if(res.rows.length === 0){
          callback(null, null);
        } else {
          for(var i = 0; i < res.rows.length; i++){
            var item = res.rows.item(i);
            if(_trimStartEndQuotes(item.id) === id){
              var result = {Item:{}};
              for(var x in item){
                result.Item[x] = {S: _trimStartEndQuotes(item[x])};
              }
              callback(null, result);
              return;
            }
          }
        }
        callback(null, null);
      }, function(tx, err){
        console.log('Error loading user data from websql');
        callback(err);
      });
    }, function(err){
      console.log('unable to open transaction');
      callback(err);
    });
  };

  p.overwriteUserData = function(userData, activityData){
    if(!userData || !userData.Item || !userData.Item.id || !userData.Item.id.S){
      console.log('Null user in OVERWRITE LOCAL', userData);
      return;
    }
    var sd = _serializeUserData.apply(this, [userData, activityData]);
    this.db.transaction(function(tx){
      tx.executeSql('SELECT * from Users where id=?', [sd.id],function(tx, res){
        if(res.rows.length === 1){
          tx.executeSql('UPDATE Users set email=?, name=?, imageData=?, activityJson=?, dev=? WHERE id=?',
              [sd.email, sd.name, sd.imageData, sd.activityJson, sd.dev, sd.id], function(){
              }, function(a, b){
                console.log('update data fail', a, b);
              });
        } else if(res.rows.length === 0){
            tx.executeSql('INSERT INTO Users (id, email, name, imageData, activityJson, dev) VALUES (?,?,?,?,?,?)',
              [sd.id, sd.email, sd.name, sd.imageData, sd.activityJson, sd.dev], function(){
              }, function(){
                console.log('add new data fail');
              });
        } else {
          alert('ERROR: DUPLICATE USER! Please email snowflake@alxgroup.net.');
        }
      }, function(err){
        console.log('Overwrite user data error');
        console.dir(err);
      });
    });
  };

  function _serializeUserData(data, activityData){
    var res = {};
    for(var x in data.Item){
      if(quotedAttributes.indexOf(x) !== -1){
        res[x] = '"' + data.Item[x].S + '"';
      } else {
        res[x] = data.Item[x].S;
      }
    }
    res.activityJson = JSON.stringify(activityData) || '';
    if(res.imageData){
      var imData = JSON.parse(res.imageData);
      for(var i = 0; i < imData.length; i++){
        var URI = App.getImageData(imData[i].url).dataURI
        if(URI){
          imData[i].dataURI = URI;
        }
      }
      res.imageData = JSON.stringify(imData);
    }
    return res;
  };

  //Removes starting and ending double quotes
  function _trimStartEndQuotes(str){
    if(str && str.indexOf('"') === 0 && str.lastIndexOf('"') === str.length - 1){
      return str.substring(1, str.length - 1);
    } else {
      return str;
    }
  }

  App.WebsqlDB = WebsqlDB;
}(App));