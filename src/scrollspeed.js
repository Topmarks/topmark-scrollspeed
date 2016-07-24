import FramesUtil from './frames-util';
import DevtoolsTimelineModel from 'devtools-timeline-model';
import ChromeHelper from 'chrome-helper';

const TRACE_CATEGORIES = ["-*", "devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "toplevel", "blink.console", "disabled-by-default-devtools.timeline.stack", "disabled-by-default-devtools.screenshot", "disabled-by-default-v8.cpu_profile"];

let scrollspeed = (app, options) => {

  let chrome;
  let rawEvents = [];
  let scrollHeight = 0;

  let chromeHelper = new ChromeHelper(options.port, options.url);
  return chromeHelper.startupChrome()
  .then((results) => chrome = results[1])
  .then(() => {
    return chrome.Runtime.evaluate({expression: "document.body.clientHeight - window.innerHeight"})
  })
  .then((params) => {
    return new Promise((resolve, reject) => {
      if(!params || !params.hasOwnProperty('result') || (params.result.value <= 0)) {
        reject('Could not determine page height or it is too small to scroll');
      } else {
        scrollHeight = -parseInt(params.result.value);
        resolve(scrollHeight);
      }
    });
  })
  .then((result) => {
    return new Promise((resolve, reject) => {
      chrome.Tracing.dataCollected((data) => {
        let events = data.value;
        rawEvents = rawEvents.concat(events);
      });
      chrome.Tracing.tracingComplete(() => {
        let model = new DevtoolsTimelineModel(rawEvents);
        let frames = new FramesUtil(model.frameModel()._frames);
        let results = {
          averageFrameRate: frames.getAverageFrameRate(),
          totalFrameCount: frames.getTotalFrameCount(),
          totalLargeFrameCount: frames.getTotalLargeFrameCount(),
          frameBreakDown: frames.getBreakDownPercentage()
        };
        app.root.addResults(options.url,module.exports.attributes.name,results);
        resolve();
      });
      chrome.Tracing.start({"categories": TRACE_CATEGORIES.join(','),"options": "sampling-frequency=10000"})
      .then(() => chrome.send('Input.synthesizeScrollGesture', {x: 0, y: 0, xDistance: 0, yDistance: scrollHeight, repeatCount: 1}))
      .then(()=> chrome.Tracing.end())
      .catch(reject);
    });
  })
  .then(() => chromeHelper.shutdownChrome());
}

scrollspeed.attributes = {
  pkg: require('../package.json'),
  name: "scrollspeed"
}

module.exports = scrollspeed;
