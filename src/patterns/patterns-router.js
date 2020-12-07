const express = require('express')
const xss = require('xss')
const PatternsService = require('./patterns-service')

const patternsRouter = express.Router()
const jsonParser = express.json()

const serializePattern = pattern => ({ // format and sanitize responses
    id: Number(pattern.id),
    name: xss(pattern.name),
    user_id: Number(xss(pattern.user_id)),
    kick_steps: pattern.kick_steps,
    snare_steps: pattern.snare_steps,
    hh1_steps: pattern.hh1_steps,
    hh2_steps: pattern.hh2_steps,
    clap_steps: pattern.clap_steps,
    perc_steps: pattern.perc_steps
  })

patternsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        PatternsService.getAllPatterns(knexInstance)
          .then(patterns => {
            res.json(patterns.map(serializePattern))
          })
          .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const {user_id, name, kick_steps, snare_steps, hh1_steps, hh2_steps, clap_steps, perc_steps} = req.body
        const newPattern = {user_id, name, kick_steps, snare_steps, hh1_steps, hh2_steps, clap_steps, perc_steps}

        for (const [key, value] of Object.entries(newPattern))
            if(value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        PatternsService.savePattern(knexInstance, newPattern)
            .then(pattern => {
                res
                    .status(201)
                    .json(serializePattern(pattern))
            })
            .catch(next)
    })

    patternsRouter
        .route('/:pattern_id')
        .all((req, res, next) => {
            const knexInstance = req.app.get('db')
            PatternsService.getPatternById(knexInstance, req.params.pattern_id)
                .then(pattern => {
                    if(!pattern) {
                        return res.status(404).json({
                            error: { message: `Pattern doesn't exist` }
                        })  
                    }
                    res.pattern = pattern
                    next()
                })
                .catch(next)
        })
        .get((req, res, next) => {
            res.json(serializePattern(res.pattern))
        })
        .delete((req, res, next) => {
            const knexInstance = req.app.get('db')
            PatternsService.deletePattern(knexInstance, req.params.pattern_id)
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })
        .patch(jsonParser, (req, res, next) => { // can be used to add an 'Edit Pattern' functionality
            const knexInstance = req.app.get('db')
            const {name, kick_steps, snare_steps, hh1_steps, hh2_steps, clap_steps, perc_steps} = req.body
            const patternToUpdate = {name, kick_steps, snare_steps, hh1_steps, hh2_steps, clap_steps, perc_steps}

            const numberOfValues = Object.values(patternToUpdate).filter(Boolean).length
            if(numberOfValues === 0) 
                return res.status(400).json({
                    error: { message: `Request body must contain updated content`}
                })
            
            PatternsService.updatePattern(knexInstance, req.params.pattern_id, patternToUpdate)
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next) 

        })




module.exports = patternsRouter