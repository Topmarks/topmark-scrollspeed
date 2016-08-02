# Scrollspeed

[![Build Status](https://travis-ci.org/Topmarks/topmark-scrollspeed.svg?branch=master)](https://travis-ci.org/Topmarks/topmark-scrollspeed) [![Code Climate](https://codeclimate.com/github/Topmarks/topmark-scrollspeed/badges/gpa.svg)](https://codeclimate.com/github/Topmarks/topmark-scrollspeed) [![Test Coverage](https://codeclimate.com/github/Topmarks/topmark-scrollspeed/badges/coverage.svg)](https://codeclimate.com/github/Topmarks/topmark-scrollspeed/coverage) [![Issue Count](https://codeclimate.com/github/Topmarks/topmark-scrollspeed/badges/issue_count.svg)](https://codeclimate.com/github/Topmarks/topmark-scrollspeed) [![Dependency Status](https://david-dm.org/topmarks/topmark-scrollspeed.svg)](https://david-dm.org/topmarks/topmark-scrollspeed) [![Inline docs](http://inch-ci.org/github/Topmarks/topmark-scrollspeed.svg?branch=master)](http://inch-ci.org/github/Topmarks/topmark-scrollspeed) [![npm version](https://badge.fury.io/js/topmark-scrollspeed.svg)](https://badge.fury.io/js/topmark-scrollspeed)

A [Topmarks](http://github.com/topmarks/topmarks) plugin to automate the testing of a website's scroll performance in chrome.

## Installation

Install from npm [npm](https://docs.npmjs.com/getting-started/installing-node).

```sh
npm install topmark-scrollspeed
```

## Usage

### Nodejs

```js
const Topmarks = require('topmarks');

const options = {
  scrollspeed: { //This will pass these options to only this plugin, alternatively you can use default for all plugins
    port: 9222 //Chrome debugging port - defaults to 9222
    url: 'http://topcoat.io' //url to test, defaults to http://topcoat.io
  }
};

let topmarks = new Topmarks(options);
topmarks.register('topmark-scrollspeed').then((results) => {
  console.log(results);
}).catch((err) => {
  console.log(err);
});
```

### CLI

If using the command line tool for Topmarks it needs to be installed globally, as well as any plugins.

```sh
npm install -g topmarks topmark-scrollspeed
```

```sh
$ topm --url http://topcoat.io --plugins topmark-scrollspeed

[ {
  "id":"topcoat",
  "plugin":"scrollspeed",
  "url":"http://topcoat.io",
  "timestamp":1468523571839,
  "report": {
    "averageFrameRate":42.41,
    "totalFrameCount":92,
    "totalLargeFrameCount":9,
    "frameBreakDown": {
      "idle":"97.84%",
      "other":"1.38%",
      "painting":"0.63%",
      "rendering":"0.08%",
      "scripting":"0.07%",
      "loading":"0%"
    }
  }
} ]
```

## Sample Report

Should return a report similar to this:

```js
[ {
  "id":"topcoat",
  "plugin":"scrollspeed",
  "url":"http://topcoat.io",
  "timestamp":1468523571839,
  "report": {
    "averageFrameRate":42.41,
    "totalFrameCount":92,
    "totalLargeFrameCount":9,
    "frameBreakDown": {
      "idle":"97.84%",
      "other":"1.38%",
      "painting":"0.63%",
      "rendering":"0.08%",
      "scripting":"0.07%",
      "loading":"0%"
    }
  }
} ]
```
