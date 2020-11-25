const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing json object', () => {
    return supertest(app)
      .get('/')
      .expect(200, {ok: true})
  })
})