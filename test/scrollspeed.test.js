/* eslint-disable func-names */
import chai from 'chai';
import Topmark from 'topmarks';
import path from 'path';

chai.should();

describe('Scrollspeed Plugin', () => {
  it('should load in topmark', function (done) {
    this.timeout(20000);
    const topmark = new Topmark({ default: { id: 'topcoat' } });
    const filePath = path.resolve(__dirname, '../src/scrollspeed');
    topmark.register(filePath).then(() => {
      topmark.results[0].report.totalFrameCount.should.be.above(0);
      done();
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      done();
    });
  });
  it('should fail if correct port not specified', (done) => {
    const topmark = new Topmark({ default: { id: 'topcoat', port: 9223 } });
    const filePath = path.resolve(__dirname, '../src/scrollspeed');
    topmark.register(filePath).then(() => {
      done();
    }).catch((err) => {
      // eslint-disable-next-line no-unused-expressions
      err.should.exist;
      done();
    });
  });
});
