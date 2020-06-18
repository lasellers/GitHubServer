const request = require("supertest");
const express = require("express");

const app = express();

const routes = require("../routes");
app.use("/", routes());

describe("Routing", function() {

  /*
  it("GET /", function(done) {
    request(app)
      .get("/")
      // .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        return done();
      });

  });

  it("GET /user/lasellers", function(done) {
    request(app)
      .get("/user/lasellers")
      // .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        return done();
      });
  });

  it("GET /user/lasellers/gists", function() {
    request(app)
      .get("/user/lasellers/gists")
      // .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
      });
  });

  it("GET /user/lasellers/followers", function(done) {
    request(app)
      .get("/user/lasellers/followers")
      // .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        return done();
      });
  });

  it("GET /user/lasellers/following", function(done) {
    request(app)
      .get("/user/lasellers/following")
      // .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        return done();
      });
  });

  */

  /* xit("GET /user/lasellers/gist/1", function() {
  request(app)
    .get("/user/lasellers/gist/1")
    // .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
    });
}); */

});
