import chai from 'chai';
import Topmark from "topmarks";
import path from "path";

chai.should();

describe('Scrollspeed Plugin', () => {
  it('should load in topmark', function (done) {
    this.timeout(20000);
    let topmark = new Topmark({default: {id: "topcoat"}});
    let filePath = path.resolve(__dirname, '../src/scrollspeed');
    topmark.register(filePath).then((results) => {
      results[0].report.totalFrameCount.should.be.above(0);
      done();
    }).catch((err) => {
      console.log(err);
    });
  });
  it('should fail if correct port not specified', function(done) {
    let topmark = new Topmark({default: {id: "topcoat", port: 9223}});
    let filePath = path.resolve(__dirname, '../src/scrollspeed');
    topmark.register(filePath).then((results) => {
      done();
    }).catch((err) => {
      err.should.exist;
      done();
    });
  });
});
