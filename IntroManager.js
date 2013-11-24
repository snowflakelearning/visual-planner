/**
 * Created by Alex on 11/21/13.
 */
window.App = window.App || {};
(function(App){

  var IntroManager = function() {
  };

/*  var p = IntroManager.prototype;
  p.initialize = function() {
    this.initialized = true;
    this.intro = introJs();
    this.introSteps = {};
  };

  p.addIntroStep = function(introName, el, intro, position){
    this.introSteps[introName] = this.introSteps[introName] || [];
    this.introSteps[introName].push({
      element: el,
      intro: intro,
      position: position
    });
  };

  p.playIntro = function(introName, visualPlanner){
    if(!this.initialized){
      this.initialize();
    }
    if(!this.introSteps[introName]){
      this['build' + introName](visualPlanner);
    }
    console.log(this.introSteps[introName]);
    this.intro.setOptions({steps: this.introSteps[introName], showStepNumbers: false});
    this.intro.refresh();
    this.intro.start();
  };

  p.buildEdit = function(vp){
    console.log(vp.header.title);
    this.addIntroStep('Edit', vp.header.title,
        'Welcome to the Snowflake Visual Planner beta!<br/>This quick tutorial will walk you through creating ' +
        'your first activity', 'right');
  };
*/
  App.IntroManager = new IntroManager();
}(App));
