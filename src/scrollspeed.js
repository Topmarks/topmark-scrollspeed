import FramesUtil from './frames-util';
import DevtoolsTimelineModel from 'devtools-timeline-model';
import ChromeHelper from 'chrome-helper';

const TRACE_CATEGORIES = ['-*',
                          'devtools.timeline',
                          'disabled-by-default-devtools.timeline',
                          'disabled-by-default-devtools.timeline.frame',
                          'toplevel',
                          'blink.console',
                          'disabled-by-default-devtools.timeline.stack',
                          'disabled-by-default-devtools.screenshot',
                          'disabled-by-default-v8.cpu_profile'];

/**
 *  Public: Topmarks plugin that simulates scrolling and captures performance
 *
 *  * `app` An {Object} representing the app that registers the plugin
 *  * `options` An {Object} of options specific to this plugin (or from defaults)
 *
 *  ## Example
 *
 *     const topmarks = new Topmarks({scrollspeed: {url: 'http://topcoat.io'}})
 *     topmarks.register('topmark-scrollspeed')
 *     .then(() => {
 *       console.log(topmarks.results);
 *     });
 *
 *  Returns a {Promise} when finished.
 */
const scrollspeed = (app, options) => {
  let chrome;
  let rawEvents = [];
  let scrollHeight = 0;

  const chromeHelper = new ChromeHelper(options.port, options.url);
  return chromeHelper.startupChrome()
  .then((results) => { chrome = results[1]; })
  .then(() => {
    const params = { expression: 'document.body.clientHeight - window.innerHeight' };
    return chrome.Runtime.evaluate(params);
  })
  .then((params) => {
    const returnPromise = new Promise((resolve, reject) => {
      if (!params || !params.hasOwnProperty('result') || (params.result.value <= 0)) {
        reject('Could not determine page height or it is too small to scroll');
      } else {
        scrollHeight = -parseInt(params.result.value, 10);
        resolve(scrollHeight);
      }
    });
    return returnPromise;
  })
  .then(() => {
    const returnPromise = new Promise((resolve, reject) => {
      chrome.Tracing.dataCollected((data) => {
        const events = data.value;
        rawEvents = rawEvents.concat(events);
      });
      chrome.Tracing.tracingComplete(() => {
        const model = new DevtoolsTimelineModel(rawEvents);
        // eslint-disable-next-line no-underscore-dangle
        const frames = new FramesUtil(model.frameModel()._frames);
        const results = {
          averageFrameRate: frames.getAverageFrameRate(),
          totalFrameCount: frames.getTotalFrameCount(),
          totalLargeFrameCount: frames.getTotalLargeFrameCount(),
          frameBreakDown: frames.getBreakDownPercentage(),
        };
        app.root.addResults(options.url, module.exports.attributes.name, results);
        resolve();
      });
      chrome.Tracing.start({
        categories: TRACE_CATEGORIES.join(','),
        options: 'sampling-frequency=10000',
      })
      .then(() => chrome.send('Input.synthesizeScrollGesture', {
        x: 0,
        y: 0,
        xDistance: 0,
        yDistance: scrollHeight,
        repeatCount: 1,
      }))
      .then(() => chrome.Tracing.end())
      .catch(reject);
    });
    return returnPromise;
  })
  .then(() => chromeHelper.shutdownChrome());
};

scrollspeed.attributes = {
  pkg: require('../package.json'),
  name: 'scrollspeed',
};

module.exports = scrollspeed;
