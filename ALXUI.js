/**
 * Created by Alex on 11/8/13.
 */
window.ALXUI = window.ALXUI || {};
(function(ui){

  var numericStyles = ['zIndex', 'fontWeight', 'opacity'];

  ui.styleEl = function(el, style){
    if(style instanceof Array){
      for(var i = 0; i < style.length; i++){
        this.styleEl(el, style[i]);
      }
      return;
    }
    var toStyle = el;
    // to make this IE8 compatible:
    // http://stackoverflow.com/questions/5747523/cross-browser-solution-for-checking-if-a-javascript-object-is-an-html-element
    if(!(el instanceof HTMLElement) && el.div instanceof HTMLElement){
      toStyle = el.div;
    }
    for(var x in style){
      if(parseFloat(style[x]) === style[x] && numericStyles.indexOf(x) === -1){
        el.style[x] = style[x] + 'px';
      } else {
        el.style[x] = style[x];
      }
    }
  };

  ui.clearStyle = function(el, style){
    var blankStyle = {};
    for(var x in style){
      blankStyle[x] = null;
    }
    this.styleEl(el, blankStyle);
  };

  ui.createEl = function(name, style){
    var el = document.createElement(name);
    this.styleEl(el, style);
    return el;
  };

  ui.addEl = function(parentNode, name, style){
    var el = this.createEl(name, style);
    parentNode.appendChild(el);
    return el;
  };

  ui.removeAllChildren = function(node){
    while(node.firstChild){
      node.removeChild(node.firstChild);
    }
  };

  ui.show = function(node){
    if(node.alxuiLastVis){
      this.styleEl(node, {display: node.alxuiLastVis});
    } else {
      this.styleEl(node, {display: 'block'});
    }
  };

  ui.hide = function(node){
    if(node.style.display !== 'none'){
      node.alxuiLastVis = node.style.display;
    }
    this.styleEl(node, {display: 'none'});
  };

  ui.setBackgroundImage = function(el, url, noContain){
    if(url === App.BLANK_IMAGE_TAG){
      this.setBackgroundImage(el, App.BLANK_IMAGE_URL, noContain);
    } else if(App.getImageData(url).dataURI){
      el.style.backgroundImage = 'url(' + App.getImageData(url).dataURI + ')';
    } else {
      el.style.backgroundImage = 'url(' + url + ')';
    }
    if(!noContain){
      ALXUI.styleEl(el, containStyle);
    }
  };

  ui.canvasToBlob = function(canvas, callback, type){
    var uri = canvas.toDataURL(type);
    var bytes = atob(uri.split(',')[1]);
    var buffer = [];
    for(var i = 0; i < bytes.length; i++){
      buffer.push(bytes.charCodeAt(i));
    }
    if(!App.css.browserIsIE()){
      callback(new Blob([ new Uint8Array(buffer), {type: type}]), type);
    } else {
      //IE doesn't support mime types in the blob constructor
      var blob = new Blob([ new Uint8Array(buffer)]);
      blob.type = type;
      callback(blob, type);
    }
  };

  var containStyle = {
    backgroundSize: 'contain',
    mozBackgroundSize: 'contain',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
  };

}(ALXUI));
