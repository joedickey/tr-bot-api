const { expect } = require('chai')
require('dotenv').config()
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const patternsRouter = require('../src/patterns/patterns-router')
const {makePatternsArray} = require('./patterns.fixtures')

describe('Patterns Endpoints', function() {
    let db
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
      })
      app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE patterns RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE patterns RESTART IDENTITY CASCADE'))

    describe('GET /api/patterns', () => {
        context ('Given no patterns', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/patterns')
                    .expect(200, [])
            })
        })

        context('Given there are patterns in the database', () => {
            const testPatterns = makePatternsArray();

            beforeEach('insert patterns', () => {
                return db
                    .into('patterns')
                    .insert(testPatterns)
            })

            it('responds 200 and all patterns', () => {
                return supertest(app)
                    .get('/api/patterns')
                    .expect(200, testPatterns)
            })

        })
    })

    describe('GET /api/patterns/:pattern_id', () => {
        context('Given no patterns in database', () => {
            it('responds 404', () => {
                const patternId = 12345
                return supertest(app)
                    .get(`/api/patterns/${patternId}`)
                    .expect(404, { error: { message: `Pattern doesn't exist` } })
            })
        })

        context('Given there are patterns in the database', () => {
            const testPatterns = makePatternsArray()
            
            beforeEach('insert patterns', () => {
                return db
                    .into('patterns')
                    .insert(testPatterns)   
            })

            it('responds with 200 and specified pattern', () => {
                const patternId = 2
                const expectedPattern = testPatterns[patternId - 1]
                return supertest(app)
                    .get(`/api/patterns/${patternId}`)
                    .expect(200, expectedPattern)
            })
        })
    })

    describe('POST /api/patterns', () => {
        it('creates pattern, responds with 201 and new pattern', () => {
            this.retries(3)
            const newPattern = {
                name: 'New Pattern',
                user_id: 2,
                kick_steps: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1],
                snare_steps: [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                hh1_steps: [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1],
                hh2_steps: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
                clap_steps: [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                perc_steps: [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0]
            }

            return supertest(app)
                .post('/api/patterns')
                .send(newPattern)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newPattern.name)
                    expect(res.body.user_id).to.eql(newPattern.user_id)
                    expect(res.body.kick_steps).to.eql(newPattern.kick_steps)
                    expect(res.body.snare_steps).to.eql(newPattern.snare_steps)
                    expect(res.body.hh1_steps).to.eql(newPattern.hh1_steps)
                    expect(res.body.hh2_steps).to.eql(newPattern.hh2_steps)
                    expect(res.body.clap_steps).to.eql(newPattern.clap_steps)
                    expect(res.body.perc_steps).to.eql(newPattern.perc_steps)
                    expect(res.body).to.have.property('id')
                })
        })
    })

    describe('DELETE /api/patterns/:pattern_id', () => {
        context('Given there are patterns in the database', () => {
            const testPatterns = makePatternsArray()
            
            beforeEach('insert patterns', () => {
                return db
                    .into('patterns')
                    .insert(testPatterns)   
            })

            it('responds with 204 and removes specified pattern', () => {
                const patternIdToRemove = 2
                const expectedPatterns = testPatterns.filter(pattern => pattern.id !== patternIdToRemove)
                return supertest(app)
                    .delete(`/api/patterns/${patternIdToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('api/patterns')
                            .expect(expectedPatterns)
                    })
            })
        })
    })

    describe('PATCH /api/patterns/:pattern_id', () => {
        context('Given there are patterns in the database', () => {
            const testPatterns = makePatternsArray()
            
            beforeEach('insert patterns', () => {
                return db
                    .into('patterns')
                    .insert(testPatterns)   
            })

            it('responds with 204 and updates specified pattern', () => {
                const patternIdToUpdate = 2
                const updatePattern = {
                    name: 'Updated Pattern'
                }
                const expectedPattern = {
                    ...testPatterns[patternIdToUpdate - 1],
                    ...updatePattern
                }

                return supertest(app)
                    .patch(`/api/patterns/${patternIdToUpdate}`)
                    .send(updatePattern)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`api/patterns${patternIdToUpdate}`)
                            .expect(expectedPattern)
                    })
            })
        })
    })

})