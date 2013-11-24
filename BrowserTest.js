//UNSUPPORTED BROWSERS
//TODO A BETTER WARNING
if(App.css.osIsAndroid() && !App.css.browserIsChrome()){
  alert('Sorry, this browser is not supported by the Snowflake Planner Beta. ' +
      'Please use the Chrome browser on you android device.')
}
if(App.css.browserIsFirefox()){
  alert('Sorry Firefox is not currently supported, please try Chrome or Safari');
}

if(App.css.browserIsIE()){
  if(parseInt(navigator.userAgent.split('MSIE ')[1].split(';')) < 10){
    alert('Sorry older versions of Internet Explorer are not supported.  ' +
        'Please update to IE10+ or upgrade to Chrome');
  }
}