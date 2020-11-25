const PatternsService = {
    getAllPatterns(db) {
        return db('patterns')
            .select('*')
    },
    getPatternById(db, id) {
        return db('patterns')
            .select('*')
            .where({id})
            .first()
    },
    savePattern(db, pattern) {
        return db('patterns')
            .insert(pattern)
            .returning('*')
            .then(rows => rows[0])
    },
    deletePattern(db, id) {
        return db('patterns')
            .where({id})
            .delete()
    },
    updatePattern(db, id, data) {
        return db('patterns')
            .where({id})
            .update(data)
    }
}

module.exports = PatternsService;