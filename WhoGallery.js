/**
 * Created by Alex on 11/20/13.
 */
window.App = window.App || {};
(function(App){

  var MAX_WHO = 7;

  var WhoGallery = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = WhoGallery.prototype = new App.DataList();
  p.dataListInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.dataListInitialize(parentNode, dispatcher);
    this.whoMoreButton = this.addDiv(whoMoreStyle, null, _onWhoMoreClick.bind(this));
    this.popup = new App.Popup(document.body, this.dispatcher, whoPopupStyle);
    this.popup.setClickOffHides();
    App.css.addTouchClickEvent(this.popup.shader, _onWhoMoreClick.bind(this));
  };

  p.addRow = function(rowData){
    var row = new App.WhoThumb(this.listContainer, this.dispatcher, rowData);
    this.dataRows.push(row);
    return row;
  };

  p.dataListUpdate = p.update;
  p.update = function(whoData, noMax){
    var whoObjectData = this.data;
    if(whoData){
      whoObjectData = _buildWhoObjectData.apply(this, [whoData]);
    }
   this.dataListUpdate(whoObjectData || this.data, 'url');
   for(var i = 0; i < whoObjectData.length; i++){
     if(noMax || i < MAX_WHO - 1 || whoObjectData.length <= MAX_WHO){
       this.dataRows[i].show();
     } else {
       this.dataRows[i].hide();
     }
   }
   if(!noMax && whoObjectData.length > MAX_WHO){
     ALXUI.show(this.whoMoreButton);
     this.whoMoreButton.textContent = 'show ' + (whoObjectData.length - MAX_WHO) +
         ' more';
   } else {
     ALXUI.hide(this.whoMoreButton);
   }
   this.listContainer.appendChild(this.whoMoreButton);
  };

  function _buildWhoObjectData(whoData){
    var res = [];
    _.each(whoData, function(r){
      res.push(App.getImageData(r));
    });
    return res;
  }

  function _onWhoMoreClick(){
    this.whoMoreExpanded = !this.whoMoreExpanded;
    if(this.whoMoreExpanded){
      this.popup.div.appendChild(this.listContainer);
      this.popup.show();
    } else {
      this.div.appendChild(this.listContainer);
      this.popup.hide();
    }
    this.update(null, this.whoMoreExpanded);
  }

  var whoMoreStyle = {
    marginTop: 80,
    height: 25,
    lineHeight: 25,
    color: '#434343',
    marginLeft: 5,
    marginRight: 5,
    width: 100,
    backgroundColor: '#ddd',
    textAlign: 'center',
    display: 'inline-block',
    cursor: 'pointer'
  };

  var whoPopupStyle = {
    maxHeight: 400,
    overflowY: 'auto',
    backgroundColor: 'white',
    boxShadow: 'rgba(61, 46, 7, 0.74902) 0px 0px 20px 0px',
    width: 700,
    padding: 10,
    position: 'fixed',
    marginLeft: -350,
    marginTop: -200,
    left: '50%',
    top: '50%',
    fontFamily: 'helvetica',
    textAlign: 'center',
  };

  App.WhoGallery = WhoGallery;
}(App));