/**
 * Created by Alex on 11/22/13.
 */
window.App = window.App || {};
(function(App){

  var SHADER_MARGIN = 3;

  var CanvasShader = function() {
    this.initialize();
  };

  var p = CanvasShader.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  p.initialize = function() {
    this.baseInitialize(document.body, null, mainStyle);
    this.canvas = ALXUI.addEl(this.div, 'canvas', canvasStyle);
    this.canvas.width = App.css.osIsIOS() ? 2048 : 3000;
    this.canvas.height = this.canvas.width;
    this.context = this.canvas.getContext('2d');
  };

  p.shadeEl = function(el, clickthrough, hideOnClickthrough){
    this.show();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if(el){
      el.scrollIntoView(false);
      var elRect = el.getBoundingClientRect();
      this.context.clearRect(elRect.left - SHADER_MARGIN, elRect.top - SHADER_MARGIN,
          elRect.right -elRect.left + 2 * SHADER_MARGIN,
          elRect.bottom - elRect.top + 2 * SHADER_MARGIN);
      if(clickthrough){
        this.div.onclick = function(e){
          var wasVis = this.div.style.display !== 'none';
          this.hide();
          var clickEl = document.elementFromPoint(e.clientX, e.clientY);
          if(el === clickEl){
            el.click(e);
            if(hideOnClickthrough){
              this.hide();
              return;
            }
          }
          if(wasVis){
            this.show();
          }
        }.bind(this);
      } else {
        this.div.onclick = null;
      }
    }
  };

  var mainStyle = {
    position: 'fixed',
    width: '100%',
    height: '100%',
    zIndex: 999999999999,
    display: 'none',
  };

  var canvasStyle = {
  };

  App.CanvasShader = CanvasShader;
}(App));