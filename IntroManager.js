/**
 * Created by Alex on 11/21/13.
 */
window.App = window.App || {};
(function(App){

  var IntroManager = function() {
  };

  var p = IntroManager.prototype;
  p.initialize = function(dispatcher) {
    this.dispatcher = dispatcher;
    this.introSteps = {};
    this.canvasShader = new App.CanvasShader();
    this.introPopup = new App.IntroPopup(this.canvasShader.div, dispatcher);
    this.dispatcher.bind('nextIntroStep', _nextIntroStep, this);
    window.addEventListener('resize', function(){
      clearTimeout(this.resizeTO);
      this.resizeTO = setTimeout(function(){
        if(this.canvasShader.div.style.display !== 'none'){
          _showCurrentStep.apply(this);
        }
      }.bind(this), 100);
    }.bind(this));
  };

  p.addIntroStep = function(introName, el, intro, position, offset, clickthrough, noButton, hideOnClickthrough){
    this.introSteps[introName] = this.introSteps[introName] || [];
    this.introSteps[introName].push({
      element: el,
      intro: intro,
      position: position,
      offset: offset,
      clickthrough: clickthrough,
      noButton: noButton,
      hideOnClickThrough: hideOnClickthrough,
    });
  };

  p.playIntro = function(introName, visualPlanner){
    this.introSteps[introName] = [];
    this['build' + introName](visualPlanner);
    _play.apply(this, [this.introSteps[introName]]);
  };

  p.buildEdit = function(vp){
    var wasEmpty = vp.list.dataRows.length === 0;
    if(wasEmpty){
      this.addIntroStep('Edit', vp.list.add, 'To get started please click the "Add" button to add a new activity now ' +
          'Then click the intro button again for more details.',
          'left,bottom', null, true, true, true);
      return;
    }
    this.addIntroStep('Edit', null, 'Welcome to the activity editor! ' +
        'The activity editor lets you create new activities and shows you an editable list of your activities and their steps.');
    this.addIntroStep('Edit', vp.list.dataRows[0].nameInput.div, 'You can describe your activity by ' +
        'entering text in the "What" text field.', "right,bottom");
    this.addIntroStep('Edit', vp.list.dataRows[0].whenInput.div, 'You can specify the time of your activity by ' +
        'entering text in the "When" text field.', "left,bottom");
    this.addIntroStep('Edit', vp.list.dataRows[0].thumb, 'You can edit your activities icon by clicking on ' +
        'it.', "right,bottom");
    this.addIntroStep('Edit', vp.list.dataRows[1].div, 'Activities are made up of steps.  An ' +
        'activity like "Go to the grocery store" might have steps like "Drive to the store", "Shop", ' +
        '"Pay Cashier", and "Drive Home".', "center,top");
    this.addIntroStep('Edit', vp.list.dataRows[1].whoInput.div, 'You can select a list of photos to indicate who will ' +
        'be present at each step in the activity.', 'left,top');
    this.addIntroStep('Edit', vp.list.topAddbutton, 'Click the "Add Step" button to add additional steps to an ' +
        'activity.', "left,top");
    this.addIntroStep('Edit', vp.list.dataRows[1].arrowContainer, 'You can reorder steps using the arrow buttons.', "right,top");
    this.addIntroStep('Edit', vp.list.dataRows[1].closer, 'To delete steps or activities click the X in the top right corner.',
        'left,top');
    if(!wasEmpty){
      this.addIntroStep('Edit', vp.list.add, 'Click the "Add" button to add a new activity', 'left,bottom');
    }
    this.addIntroStep('Edit', vp.list.saveNotice, 'As you make changes your activities are ' +
        'automatically saved to the cloud.', 'right,bottom');
    this.addIntroStep('Edit', vp.list.preview, 'When you are done editing your activities click the "View" button ' +
        'to view them.', "left,bottom");

  };

  p.buildActivityList = function(vp){
    var wasEmpty = vp.list.dataRows.length === 0;
    this.addIntroStep('ActivityList', null,
        'This is your home dashboard with a list of all your saved activities.');
    if(wasEmpty){
      this.addIntroStep('ActivityList', vp.list.preview, "Right now you don't have any activities, please click the " +
        '"Edit" button to create a new activity in the Activity Editor.', "left,bottom", null, true, true, true);
      return;
    }
    this.addIntroStep('ActivityList', vp.list.dataRows[0].detailsButton, 'Click the "View" button on any activity ' +
        'to see the step by step view of that activity', "right,bottom", null, true, false, true);
    this.addIntroStep('ActivityList', vp.list.preview, 'To add new activities or to edit existing ones you can' +
        ' click the "Edit" button.', "left,bottom", null, true, false, true);
  };

  p.buildDetail = function(vp){
    this.addIntroStep('Detail', null,
        'This screen shows a step by step view of a given Activity.');
    this.addIntroStep('Detail', vp.detailView.back, "To return to your list of activities click here", "right,bottom",
        null, true, false, true);
    this.addIntroStep('Detail', vp.detailView.list.dataRows[0].hide, 'You can hide a step by clicking here. If any ' +
        'steps are hidden a button will appear in the top right that lets you show all hidden steps.',
        "left,bottom", null, true, false, true);
  };

  p.buildNewUser = function(vp){
    this.addIntroStep('NewUser', null,
        'Welcome to the Snowflake Visual Planner beta!  This quick tutorial will walk you through creating ' +
        'your first activity.');
    this.addIntroStep('NewUser', vp.header.uservoiceButton, "If you have any feedback or just need help " +
        "you can contact us any time by clicking here.",
        "left,bottom");
    this.addIntroStep('NewUser', vp.header.introButton, "You are in the 'Activity Editor'.  You " +
        "can click here at any time to view a walk-through of the current interface.<br/><br/>" +
        "Try it now!",
         "left,bottom", null, true, false, false);
  };

  function _play(steps){
    this.currentIntro = steps;
    this.currentStep = 0;
    _showCurrentStep.apply(this);
  }

  function _nextIntroStep(){
    this.currentStep++;
    if(this.currentStep < this.currentIntro.length){
      _showCurrentStep.apply(this);
    } else {
      this.canvasShader.hide();
    }
  }

  function _showCurrentStep(){
    var step = this.currentIntro[this.currentStep];
    this.canvasShader.shadeEl(step.element, step.clickthrough, step.hideOnClickThrough);
    if(step.element){
      this.introPopup.setPos(step.element, step.position, step.offset);
    } else {
      this.introPopup.center();
    }
    this.introPopup.setText(step.intro,
        this.currentStep === this.currentIntro.length - 1);
    this.introPopup.setButtonVis(!step.noButton);
  };

  App.IntroManager = new IntroManager();
}(App));
