import { assert } from 'chai';
import { expect } from 'chai';
// import { should } from 'chai';
import * as callMe from '../src/placeholder';

describe('#rockstar', () => {
  it('should return a string', () => {
    let result = callMe.rockstar();
    assert.isString(result);
  });
  it('should call you a rockstar', () => {
    let result = callMe.rockstar();
    expect(result).to.have.string('You are a rockstar!');
  });
});