const chaiHttp = require('chai-http')
const chai     = require('chai')
const assert   = chai.assert
const server   = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', () => {
  
    suite('POST /api/issues/{project} => object with issue data', () => {
      
      test('Every field filled in', done => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.issue_title, 'Title')
            assert.equal(res.body.issue_text, 'text')
            assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
            assert.equal(res.body.assigned_to, 'Chai and Mocha')
            assert.equal(res.body.status_text, 'In QA')
          
            done()
          })
      })
      
      test('Required fields filled in', done => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.issue_title, 'Title')
            assert.equal(res.body.issue_text, 'text')
            assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
            assert.equal(res.body.assigned_to, '')
            assert.equal(res.body.status_text, '')
          
            done()
          })
      })
      
      test('Missing required fields', done => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            random: 'garbage'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'required fields are not present')
          
            done()
          })
      })
      
    })
    
    suite('PUT /api/issues/{project} => text', () => {
      
      test('No body', done => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end((err, res) => {
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: res.body._id
              })
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.text, 'no updated field sent')

                done()
              })
          })
      })
      
      test('One field to update', done => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end((err, res) => {
            const theId = res.body._id
            
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: theId,
                issue_title: 'New Title'
              })
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.text, 'successfully updated ' + theId)

                done()
              })
          })
      })
      
      test('Multiple fields to update', done => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end((err, res) => {
            const theId = res.body._id
            
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: theId,
                issue_title: 'New Title',
                issue_text: 'New text',
                created_by: 'New creator',
                assigned_to: 'New assignment',
                status_text: 'New status'
              })
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.text, 'successfully updated ' + theId)

                done()
              })
          })
      })
      
    })
    
    suite('GET /api/issues/{project} => Array of objects with issue data', () => {
      
      test('No filter', done => {
        chai.request(server)
          .get('/api/issues/test')
          .query({})
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'issue_title')
            assert.property(res.body[0], 'issue_text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'updated_on')
            assert.property(res.body[0], 'created_by')
            assert.property(res.body[0], 'assigned_to')
            assert.property(res.body[0], 'open')
            assert.property(res.body[0], 'status_text')
            assert.property(res.body[0], '_id')
          
            done()
          })
      })
      
      test('One filter', done => {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            issue_title: 'New Title'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            res.body.forEach(issue => {
              assert.equal(issue.issue_title, 'New Title')
            })
          
            done()
          })
      })
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', done => {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            issue_title: 'New Title',
            status_text: 'New status'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            res.body.forEach(issue => {
              assert.equal(issue.issue_title, 'New Title')
              assert.equal(issue.status_text, 'New status')
            })
          
            done()
          })
      })
      
    })
    
    suite('DELETE /api/issues/{project} => text', () => {
      
      test('No _id', done => {
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            random: 'garbage'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.text, '_id error')
          
            done()
          })
      })
      
      test('Valid _id', done => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end((err, res) => {
            const theId = res.body._id
            
            chai.request(server)
              .delete('/api/issues/test')
              .send({
                _id: theId
              })
              .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.text, 'deleted ' + theId)

                done()
              })
          })
      })
      
    })

})
