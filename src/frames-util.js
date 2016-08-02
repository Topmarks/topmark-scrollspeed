/* eslint-disable no-underscore-dangle */
/**
 *  Public: a frame utility that helps analyze frames returned from `devtools-timeline-model`
 */
export default class FramesUtil {
  /**
   *  Public: constructor
   *
   *  * `frames` an {Array} of frames from `devtools-timeline-model`
   *
   *  ## Example
   *
   *     const model = new DevtoolsTimelineModel(rawEvents);
   *     const frames = new FramesUtil(model.frameModel()._frames);
   */
  constructor(frames) {
    this.frames = frames;
    this.framesAnalysis = this._analyzeFrames(this.frames);
  }
  /**
   *  Private: makes the frames a bit more readable.
   *
   *  * `frames` an {Array} of frames from `devtools-timeline-model`
   *
   *  ## Example
   *
   *     this.framesAnalysis = this._analyzeFrames(this.frames);
   *
   *  Returns an {Object} of results
   */
  _analyzeFrames(frames) {
    const result = {
      repaints: 0,
      largeFrames: [],
      totalDuration: 0,
      timeByCategory: {
        idle: 0,
        other: 0,
        painting: 0,
        rendering: 0,
        scripting: 0,
        loading: 0,
      },
    };
    frames.forEach((frame) => {
      if (frame.duration > 18) {
        result.largeFrames.push(frame);
      }
      result.totalDuration += frame.duration;
      result.repaints += frame.paints.length;

      let categoryTotal = 0;

      Object.keys(frame.timeByCategory).forEach((category) => {
        result.timeByCategory[category] += frame.timeByCategory[category];
        categoryTotal += frame.timeByCategory[category];
      });

      result.timeByCategory.idle += frame.duration - categoryTotal;
    });

    return result;
  }
  /**
   *  Private: simpler helper function to round the large decimal floats
   *
   *  * `float` {Float} - the number to round.
   *  * `count` {Int} - the number of digits to keep after the decimal.
   *
   *  ## Example
   *
   *     this._roundDigits(1 / ((this.framesAnalysis.totalDuration / this.frames.length) / 1000));
   *
   *  Returns a {Float}
   */
  _roundDigits(float, count = 2) {
    const power = Math.pow(10, count);
    return Math.round(float * power) / power;
  }
  /**
   *  Public: returns the average frame rate from the collection of frame lengths.
   *
   *  ## Example
   *
   *     const model = new DevtoolsTimelineModel(rawEvents);
   *     const frames = new FramesUtil(model.frameModel()._frames);
   *     console.log(frames.getAverageFrameRate());
   *
   *  Returns a {Float}
   */
  getAverageFrameRate() {
    return this._roundDigits(1 / ((this.framesAnalysis.totalDuration / this.frames.length) / 1000));
  }
  /**
   *  Public: the total number of frames captured.
   *
   *  ## Example
   *
   *     const model = new DevtoolsTimelineModel(rawEvents);
   *     const frames = new FramesUtil(model.frameModel()._frames);
   *     console.log(frames.getTotalFrameCount());
   *
   *  Returns an {Int}
   */
  getTotalFrameCount() {
    return this.frames.length;
  }
  /**
   *  Public: returns the total number of frames that lasted longer than 18ms
   *
   *  ## Example
   *
   *     const model = new DevtoolsTimelineModel(rawEvents);
   *     const frames = new FramesUtil(model.frameModel()._frames);
   *     console.log(frames.getTotalLargeFrameCount());
   *
   *  Returns an {Int}
   */
  getTotalLargeFrameCount() {
    return this.framesAnalysis.largeFrames.length;
  }
  /**
   *  Public: Returns an object of frame breakdowns.
   *
   *  ## Example
   *
   *     const model = new DevtoolsTimelineModel(rawEvents);
   *     const frames = new FramesUtil(model.frameModel()._frames);
   *     console.log(frames.getBreakDownPercentage());
   *
   *  Returns an {Object} of frame breakdown percentages.
   */
  getBreakDownPercentage() {
    const result = {};
    Object.keys(this.framesAnalysis.timeByCategory).forEach((category) => {
      const categoryTime = this.framesAnalysis.timeByCategory[category];
      const totalTime = this.framesAnalysis.totalDuration;
      result[category] = `${this._roundDigits((categoryTime / totalTime) * 100)}%`;
    });
    return result;
  }
}
