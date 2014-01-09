window.App = window.App || {};
(function(App){

  var SF_PREFIX = 'images/snowflake';

  var SNOWFLAKE_SPIN_START = 1000;
  var BOX_FADE_OUT_END = SNOWFLAKE_SPIN_START + 1500;
  var NUM_SNOWFLAKES = 6;
  var ICE_BG_IMAGE = 'images/ice-stripes.svg';
  var IOS_LAG = App.css.osIsIOS() ? 1000 : 0;

  var AnimationManager = function(parentNode, dispatcher) {
    this.initialize(parentNode, dispatcher);
  };

  var p = AnimationManager.prototype = new App.VPBase();
  p.baseInitialize = p.initialize;

  p.initialize = function(parentNode, dispatcher) {
    this.baseInitialize(parentNode, dispatcher);
    this.blocker = ALXUI.addDivTo(parentNode, blockerStyle);
    this.dispatcher.bind('hideStep', _animateStepComplete, this);
    this.dispatcher.bind('setStepAnimate', function(on){
      this.stepAnimate = on;
    }, this);
    this.stepAnimate = true;
  };

  function _animateStepComplete(stepBox){
    if(!this.stepAnimate){
      stepBox.hide();
      this.dispatcher.trigger('stepHidden'); //fires after hide is complete
      return;
    }
    ALXUI.show(this.blocker);
    App.css.addTransitionStyle(['all'], stepBox.div, 0.5);
    stepBox.style(stepCompleteBoxStyle);
    App.css.setScaleTransform(stepBox.div,.8,.8);
    var bg = _snowflakeDance.apply(this, [stepBox]);
    setTimeout(function(){
      App.css.addTransitionStyle(['all'], stepBox.div, 2);
      ALXUI.styleEl(stepBox.div, {opacity: 0});;
    }, SNOWFLAKE_SPIN_START + (stepBox.num + 1) * 200 + IOS_LAG);
    setTimeout(function(){
      stepBox.hide();
      stepBox.div.removeChild(bg);
      ALXUI.clearStyle(stepBox.div, stepCompleteBoxStyle);
      ALXUI.styleEl(stepBox.div, {opacity: 1});
      App.css.setScaleTransform(stepBox.div,1,1);
      ALXUI.styleEl(stepBox.div, App.css.generateRotationStyle(0, 0, 0));
      this.dispatcher.trigger('stepHidden'); //fires after hide is complete
      ALXUI.hide(this.blocker);
    }.bind(this), BOX_FADE_OUT_END + (stepBox.num + 1) * 200 + IOS_LAG);
  }

  function _snowflakeDance(stepBox){
    var sfs = [];
    var rand;
    var bg = ALXUI.addDivTo(stepBox.div, [bgStyle]);
    var imBg = ALXUI.addDivTo(bg, [bgStyle, imBgStyle]);
    ALXUI.setBackgroundImage(imBg, ICE_BG_IMAGE);
    var startSnowflakeStyles = _generateSnowflakeStarts.apply(this, [stepBox.num + 1, bg]);
    var snowflakeFormationStyles = _generateSnowflakeFormation.apply(this, [stepBox.num + 1, bg]);
    for(var i = 0; i <= stepBox.num; i++){
      rand = Math.floor(Math.random() * NUM_SNOWFLAKES + 1);
      sfs.push(ALXUI.addDivTo(bg, [snowflakeStyle,
         startSnowflakeStyles[i]]));
      ALXUI.setBackgroundImage(sfs[i], SF_PREFIX + rand  + '.svg');
      App.css.addTransitionStyle(['all'], sfs[i], 1);
    }
    setTimeout(function(){

      var rotationStyle = App.css.generateRotationStyle(0, 0, 0);
      for(var i = 0; i <= stepBox.num; i++){
        ALXUI.styleEl(sfs[i], [snowflakeFormationStyles[i], rotationStyle]);
      }
    }, 10);

    var spinStyle = App.css.generateRotationStyle(0, 0, 360);
    for(var i = 0; i < sfs.length; i++){
      setTimeout(_createSpinFunc(sfs, i, spinStyle), SNOWFLAKE_SPIN_START + i * 200);
    }
    setTimeout(function(){
      this.dispatcher.trigger('playSound', 'stepComplete');
    }.bind(this), SNOWFLAKE_SPIN_START)
    return bg;
  }

  function _createSpinFunc(sfs, i, spinStyle){
    return function(){
      App.css.addTransitionStyle(['all'], sfs[i], 0.5);
      ALXUI.styleEl(sfs[i], spinStyle);
    }
  }

  function _generateSnowflakeFormation(num, bg){
    var styles = [];
    var size = Math.min(100, bg.offsetWidth / num);
    var padding = 5;
    for(var i = 0; i < num; i++){
      styles.push({
        top: (bg.offsetHeight - size) / 2,
        left: bg.offsetWidth / 2 + size * i - num * size / 2 + padding * (i + 1),
        width: size - 2 * padding,
        height: size - 2 * padding,
      });
    }
    return styles;
  }

  function _generateSnowflakeStarts(num, bg){
    var styles = [];
    var angle;
    var size = Math.min(90, (bg.offsetWidth / num - 10)) * 2;
    var x, y;
    for(var i = 0; i < num; i++){
      angle = i * 2 * Math.PI / num - Math.PI / 2;
      x = Math.cos(angle) * 2000 + bg.offsetWidth / 2;
      y = Math.sin(angle) * 2000 + bg.offsetHeight / 2;
      styles.push({
        width: size,
        height: size,
        top: y,
        left: x,
      });
    }
    return styles;
  }

  var stepCompleteBoxStyle = {
    border: 'solid 1px #434343',
  };

  var snowflakeStyle = {
    position: 'fixed',
  };

  var bgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  var imBgStyle = {
    opacity: 0.5,
  };

  var blockerStyle = {
    position: 'fixed',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    display: 'none',
  }

  App.AnimationManager = AnimationManager;
}(App));