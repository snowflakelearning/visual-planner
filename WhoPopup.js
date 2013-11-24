/**
 * Created by Alex on 11/20/13.
 */
window.App = window.App || {};
(function(App){

  var MAX_WHO = 7;

  var WhoPopup = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = WhoPopup.prototype;
  p.initialize = function(parentNode, dispatcher) {
    this.parentNode = parentNode;
    this.div = ALXUI.addEl(parentNode, 'div');
    this.whoMoreButton = ALXUI.addEl(this.div, 'div', whoMoreStyle);
    App.css.addTouchClickEvent(this.whoMoreButton, _onWhoMoreClick.bind(this));
    this.shader = this.createShader(document.body);
    this.popupDiv = this.div;
    this.addCloser();
    ALXUI.styleEl(this.closer, closerStyle);
    App.css.addTouchClickEvent(this.shader, function(e){
      if(e.target === this.shader){
        _onWhoMoreClick.apply(this);
      }
    }.bind(this));
    ALXUI.hide(this.closer);
  };

  p.createShader = App.Popup.prototype.createShader;
  p.addCloser = App.Popup.prototype.addCloser;
  p.hide = function(){
    _onWhoMoreClick.apply(this);
  };

  function _onWhoMoreClick(){
    this.whoMoreExpanded = !this.whoMoreExpanded;
    this.populate(null, this.whoMoreExpanded);
    if(this.whoMoreExpanded){
      this.whoMoreButton.textContent = 'close';
      this.shader.appendChild(this.div);
      ALXUI.show(this.shader);
      ALXUI.show(this.closer);
      ALXUI.hide(this.whoMoreButton);
      ALXUI.styleEl(this.div, [whoThumbPopupStyle, {marginTop: -this.div.offsetHeight / 2}]);
    } else {
      ALXUI.hide(this.closer);
      ALXUI.hide(this.shader);
      this.parentNode.appendChild(this.div);
      ALXUI.clearStyle(this.div, whoThumbPopupStyle);
    }
  }

  p.populate = function(whoData, noMax){
    if(whoData){
      this.whoData = whoData;
    }
    ALXUI.removeAllChildren(this.div);
    this.div.appendChild(this.closer);
    ALXUI.hide(this.whoMoreButton);
    for(var i = 0; i < this.whoData.length; i++){
      if(!noMax && i === MAX_WHO - 1 && this.whoData.length > MAX_WHO){
        ALXUI.show(this.whoMoreButton);
        this.whoMoreButton.textContent = 'show ' + (this.whoData.length - i) +
            ' more';
        break;
      }
      var thumb = new App.WhoThumb(this.div, this.dispatcher);
      thumb.setAppearance(this.whoData[i], App.getImageData(this.whoData[i]).text);
    }
    this.div.appendChild(this.whoMoreButton);
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

  var whoThumbPopupStyle = {
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

  var closerStyle = {
    position: 'absolute',
  }

  App.WhoPopup = WhoPopup;
}(App));