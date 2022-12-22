const { expect } = require('chai');
const { promiseCombiner } = require('../promiseCombiner' );

describe('promiseCombiner', () => {
  const checkResolved = (c, expectedValue) => {
    expect(c).to.be.instanceof(Promise);
    return c.then(value => {
      expect(value).to.equal(expectedValue);
    });
  }

  const checkRejected = (c, expectedError) => {
    expect(c).to.be.instanceof(Promise);
    return c
      .then(() => expect(false).to.be.ok)
      .catch(value => {
        expect(value).to.equal(expectedError);
      });
  }

  it('sums resolved promise values', () => {
    const c = promiseCombiner(
      Promise.resolve(2),
      Promise.resolve(3),
      Promise.reject('error')
    );
    return checkResolved(c, 5);
  });

  it('rejects if all promises are rejected', () => {
    const c = promiseCombiner(
      Promise.reject('error'),
      Promise.reject('another error')
    );
    return checkRejected(c, 0);
  });

  it('sums resolved promise values when they are 0', () => {
    const c = promiseCombiner(
      Promise.resolve(0),
      Promise.resolve(0),
    );
    return checkResolved(c, 0);
  });

  it('throws an error if called with no arguments', () => {
    expect(() => promiseCombiner()).to.throw;
  });

});
