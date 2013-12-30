//UNSUPPORTED BROWSERS
//TODO A BETTER WARNING
if(App.css.osIsAndroid() && !App.css.browserIsChrome()){
  mixpanel.track('AndroidBrowserWarningShown');
  alert('Sorry, this browser is not supported by the Snowflake Planner Beta. ' +
      'Please use the Chrome browser on you android device.')
}

if(App.css.browserIsIE()){
  mixpanel.track('IEWarningShown');
  alert('Sorry Internet Explorer is not currently supported, please try Chrome or Safari');
}