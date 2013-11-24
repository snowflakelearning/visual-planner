/**
 * Created by Alex on 11/22/13.
 */
window.App = window.App || {};
(function(App){

  var SHADER_MARGIN = 0;

  var CanvasShader = function() {
    this.initialize();
  };

  var p = CanvasShader.prototype;
  p.initialize = function() {
    this.div = ALXUI.addEl(document.body, 'div', mainStyle);
    this.canvas = ALXUI.addEl(this.div, 'canvas', canvasStyle);
    window.addEventListener('resize', _onResize.bind(this));
    _onResize.apply(this);
    this.context = this.canvas.getContext('2d');
  };

  p.shadeEl = function(el){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.rect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.context.fill();
    var elRect = el.getBoundingClientRect();
    this.context.clearRect(elRect.left - SHADER_MARGIN, elRect.top - SHADER_MARGIN,
        elRect.right -elRect.left + 2 * SHADER_MARGIN,
        elRect.bottom - elRect.top + 2 * SHADER_MARGIN);
    el.addEventListener('click', function(){
      console.log('hi');
    })
    this.div.onclick = function(e){
      ALXUI.hide(this.div);
      var clickEl = document.elementFromPoint(e.clientX, e.clientY);
      if(el === clickEl){
        el.click();
      }
      ALXUI.show(this.div);
    }.bind(this);
  };

  function _onResize(){
    this.canvas.width = this.div.offsetWidth;
    this.canvas.height = this.div.offsetHeight;
  }

  var mainStyle = {
    position: 'fixed',
    width: '100%',
    height: '100%',
    zIndex: 999999999999,
  };

  var canvasStyle = {
    width: '100%',
    height: '100%',
  };

  App.CanvasShader = CanvasShader;
}(App));