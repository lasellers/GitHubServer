const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

describe("hello world tests", function() {

  it("assert test", function() {
    assert.equal(2, 1 + 1);
  });

  it("expect test", function() {
    expect(1 + 1).to.equal(2);
  });

  it("should test", function() {
    const calc = 1 + 1;
    calc.should.equal(2);
  });
});
