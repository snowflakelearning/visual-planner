/**
 * Created by Alex on 11/11/13.
 */
window.App = window.App || {};
(function(App){

  var HEADER_FONT_SIZE = 28;

  var DataList = function(parentNode, dispatcher) {
    if(parentNode){
      this.initialize(parentNode, dispatcher);
    }
  };
  var p = DataList.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.baseInitialize(parentNode, dispatcher);
    this.header = this.addDiv(headerStyle);
    this.listContainer = this.addDiv(listStyle);
    this.dataRows = [];
  };

  p.addRow = function(rowData){
    var row = this.createRow(rowData);
    this.dataRows.push(row);
    this.listContainer.appendChild(row.div);
    return row;
  };

  p.createRow = function(){
    //Child classes implement
  };

  p.removeRow = function(row){
    this.dataRows.splice(this.dataRows.indexOf(row), 1);
    this.listContainer.removeChild(row.div);
  };

  p.update = function(data, idField, stripe){
    this.data = data;
    _addRows.apply(this, [data, idField]);
    _removeRows.apply(this, [data, idField]);
    for(var i = 0; i < data.length; i++){
      this.dataRows[i].update(data[i], i);
    }
  };

  function _addRows(data, idField){
    _.each(data, function(d){
        if(!_.find(this.dataRows, function(t){
          return t.data[idField] === d[idField];
        })){
          this.addRow(d);
        }
    }.bind(this));
  }

  function _removeRows(data, idField){
    var toRemove = [];  //We need to build a list of want we
                        //want to remove and then remove it after _.each
                        //else _.each doesn't deal with the array length changing well
    _.each(this.dataRows, function(t){
      if(!_.find(data, function(r){
        return r[idField] === t.data[idField];
      })){
        toRemove.push(t);
      }
    }.bind(this));
    _.each(toRemove, function(t){
      this.removeRow(t);
    }.bind(this));
  }

  var headerStyle = {
    fontSize: HEADER_FONT_SIZE,
    color: App.DARK_BLUE,
    textAlign: 'center',
    fontWeight: 700,
    lineHeight: HEADER_FONT_SIZE * 2.5,
  };

  var listStyle = {
  };

  App.DataList = DataList;
}(App));