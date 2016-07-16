const FramesUtil = require('./frames-util');
const DevtoolsTimelineModel = require('devtools-timeline-model');

let TRACE_CATEGORIES = ["-*", "devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "toplevel", "blink.console", "disabled-by-default-devtools.timeline.stack", "disabled-by-default-devtools.screenshot", "disabled-by-default-v8.cpu_profile"];

let scrollspeed = (app, options) => {
  return new Promise((resolve, reject) => {
    app.Chrome.New({port: options.port, url: options.url}).then((tab) => {
      app.Chrome({port: options.port}).then((chrome) => {
        chrome.Runtime.evaluate({expression: "document.body.clientHeight - window.innerHeight"}).then((params) => {
          if(!params) {
            reject(Error('Could not determine page height'));
          } else if (params.result.value <= 0) {
            reject(Error('The page is too small to scroll'));
          } else {
            app.scrollHeight = -parseInt(params.result.value);

            let rawEvents = [];

            chrome.Tracing.dataCollected((data) => {
              let events = data.value;
              rawEvents = rawEvents.concat(events);
            });

            chrome.Tracing.tracingComplete(() => {
              app.Chrome.Close({port: options.port, id: tab.id}).then(() => {
                chrome.ws.onclose = (event) => {
                  let model = new DevtoolsTimelineModel(rawEvents);
                  let frames = new FramesUtil(model.frameModel()._frames);
                  let results = {
                    averageFrameRate: frames.getAverageFrameRate(),
                    totalFrameCount: frames.getTotalFrameCount(),
                    totalLargeFrameCount: frames.getTotalLargeFrameCount(),
                    frameBreakDown: frames.getBreakDownPercentage()
                  };
                  app.root.addResults(options.url,module.exports.attributes.name,results);
                  event.target.removeAllListeners();
                  resolve();
                }
                chrome.ws.close();
              }).catch(err => reject(Error(err)));
            });

            chrome.Tracing.start({
              "categories": TRACE_CATEGORIES.join(','),
              "options": "sampling-frequency=10000"
            }).then((params)=>{
              chrome.send('Input.synthesizeScrollGesture', {x: 0, y: 0, xDistance: 0, yDistance: app.scrollHeight, repeatCount: 1}).then((params)=>{
                chrome.Tracing.end()
              }).catch((err) => {
                reject(Error(err));
              });
            }).catch(err => reject(Error(err)));

          }
        });
      });
    }).catch(err => reject(Error(err)));
  });
}

scrollspeed.attributes = {
  pkg: require('../package.json'),
  name: "scrollspeed"
}

module.exports = scrollspeed;
