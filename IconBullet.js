/**
 * Created by Alex on 12/4/13.
 */
window.App = window.App || {};
(function(App){
  var IconBullet = function(parentNode, dispatcher, bulletData) {
    this.initialize(parentNode, dispatcher, bulletData);
  };

  var p = IconBullet.prototype;
  p.initialize = function(parentNode, dispatcher, bulletData) {
    this.div = ALXUI.addEl(parentNode, 'div', boxStyle);
    this.icon = ALXUI.addEl(this.div, 'div', iconStyle);
    ALXUI.setBackgroundImage(this.icon, bulletData.icon);
    this.text = ALXUI.addEl(this.div, 'div', bulletStyle);
    this.text.innerHTML = bulletData.text;
  };

  p.setSize = function(w, h){
    ALXUI.styleEl(this.div, {width: w, height: h});
  };

  p.textOnTop = function(){
    this.div.insertBefore(this.text, this.icon);
    ALXUI.styleEl(this.icon, {marginTop: 5, marginBottom: 5});
  };

  var boxStyle = {
    marginTop: 15,
    width: 200,
    marginLeft: 25,
    height: 140,
    cssFloat: 'left',
    textAlign: 'center',
  };

  var iconStyle = {
    width: '100%',
    height: '50%',
    marginBottom: 10,
  };

  var bulletStyle = {
    width: '100%',
    height: '21%',
    marginTop: 3,
    marginBottom: 3,
  };

  App.IconBullet = IconBullet;
}(App));
