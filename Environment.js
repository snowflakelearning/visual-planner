/**
 * Created by Alex on 11/21/13.
 */
window.App = window.App || {};
(function(){

  App.VERSION = '0.0.0';

  //Use the prod app id on staging and production
  var useProdAppId = window.location.hostname.indexOf('snowflakelearning.com') !== -1;
  //only use prod mixpanel on production site
  var useProdMixpanel = useProdAppId && window.location.href.indexOf('staging') === -1;

  App.FB_APP_ID = useProdAppId ? 637226376333629 : 1411429815757025;
  App.MP_ID = useProdMixpanel ? 'a851a75166e0fe041ccf63a671dbe2ee' :
      '7bba5a12c47185e465979eb7d4c4eff2';

  App.ARN = useProdAppId ? 'arn:aws:iam::756088659563:role/VisualPannerProd' :
      'arn:aws:iam::756088659563:role/testJsSDK';

  App.OFFLINE_ENABLED = useProdAppId;
}());