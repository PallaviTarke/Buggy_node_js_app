// tests/app.test.js
const request = require('supertest');
const app = require('../app');

describe("GET /", () => {
  it("should return 200", async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});
