'use strict'

const expect      = require('chai').expect
const mongodb       = require('mongodb')
const MongoClient = require('mongodb').MongoClient
const ObjectId    = require('mongodb').ObjectID

const connection = MongoClient.connect(process.env.DATABASE, {useNewUrlParser: true})
// const db = connection.db('issue-tracker')

module.exports = app => {

  app.route('/api/issues/:project')
  
    //Array of all issues
    .get((req, res) => {
      const possibleFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text']
      
      let filterObject = {}
      filterObject.project = req.params.project
      possibleFields.forEach(field => {
        if (req.query[field]) {
          filterObject[field] = req.query[field]
        }
      })
      if (req.query.open) {
        switch (req.query.open) {
          case 'true':
            filterObject.open = true
            break
          case 'false': 
            filterObject.open = false
            break
          default:
            filterObject.open = req.query.open
        }
        }
      
      connection.then(client => {
        const db = client.db('issue-tracker')
        
        db.collection('issues')
          .find(filterObject)
          .toArray()
          .then(data => {
            return res.json(data.map(issue => issue = {
              _id         : issue._id,
              issue_title : issue.issue_title,
              issue_text  : issue.issue_text,
              created_on  : issue.created_on,
              updated_on  : issue.updated_on,
              created_by  : issue.created_by,
              assigned_to : issue.assigned_to,
              open        : issue.open,
              status_text : issue.status_text
            }))
          })
          .catch(error => {
            console.log(error)
            return res.type('text').send('some error') //
          })
      })
    })
    
    //Add new issue
    .post((req, res) => {
      if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
        
        connection.then(client => {
          const db = client.db('issue-tracker')
          
          db.collection('issues')
            .insertOne({
              project     : req.params.project, //auto
              issue_title : req.body.issue_title, //required
              issue_text  : req.body.issue_text, //required
              created_on  : new Date(), //auto
              updated_on  : new Date(), //auto
              created_by  : req.body.created_by, //required
              assigned_to : req.body.assigned_to ? req.body.assigned_to : '', //optional
              open        : true, //auto
              status_text : req.body.status_text ? req.body.status_text : '' //optional
            })
            .then(data => {
              console.log('New issue submitted ' + data.ops[0]._id)     
              return res.json({
                _id         : data.ops[0]._id,
                issue_title : data.ops[0].issue_title,
                issue_text  : data.ops[0].issue_text,
                created_on  : data.ops[0].created_on,
                updated_on  : data.ops[0].updated_on,
                created_by  : data.ops[0].created_by,
                assigned_to : data.ops[0].assigned_to,
                open        : data.ops[0].open,
                status_text : data.ops[0].status_text
              })
            })
            .catch(error => {
              console.log(error)
              return res.type('text').send('couldn\'t add')
            })
        })
        
      } else {
        res.type('text').send('required fields are not present')
      }
    })
    
    //Update existing issue
    .put((req, res) => {
      const possibleFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text']
      
      let updateObject = {}
      possibleFields.forEach(field => {
        if (req.body[field]) {
          updateObject[field] = req.body[field]
        }
      })
    
      if (req.body.open === 'false') {
        updateObject.open = false
      }
      
      let id
      try {
        id = req.body._id ? new ObjectId(req.body._id) : 'invalid id'
      }
      catch(error) {
        id = 'invalid id'
      }
      
      if (id !== 'invalid id') {
        //Returns false if updateObject is empty
        if ( !(Object.entries(updateObject).length === 0 && updateObject.constructor === Object) ) {
          updateObject.updated_on = new Date()
          
          connection.then(client => {
            const db = client.db('issue-tracker')

            db.collection('issues')
              .findOneAndUpdate({
                _id: id
              }, {
                $set: updateObject
              })
              .then(() => {
                console.log('successfully updated ' + req.body._id)
                return res.type('text').send('successfully updated ' + req.body._id)
              })
              .catch(error => {
                console.log(error)
                return res.type('text').send('could not update ' + req.body._id)
              })
          })
          
        } else {
          return res.type('text').send('no updated field sent')
        }
      } else {
        return res.type('text').send('_id error')
      }
    })
    
    //Delete issue
    .delete((req, res) => {
      let id
      try {
        id = req.body._id ? new ObjectId(req.body._id) : 'invalid id'
      }
      catch(error) {
        id = 'invalid id'
      }
      
      if (id !== 'invalid id') {
        
        connection.then(client => {
          const db = client.db('issue-tracker')
          
          db.collection('issues')
            .findOneAndDelete({
              _id: id
            })
            .then(() => {
              console.log('deleted ' + req.body._id)
              return res.type('text').send('deleted ' + req.body._id)
            })
            .catch(error => {
              console.log(error)
              return res.type('text').send('could not delete ' + req.body._id)
            })
        })
        
      } else {
        return res.type('text').send('_id error')
      }
    })
    
//   //Removes all documents created by functional tests
//   app.route('/debug/gc')
//     .get((req, res) => {
//       connection.then(client => {
//         const db = client.db('issue-tracker')
        
//         db.collection('issues')
//           .deleteMany({
//             project: 'test'
//           })
//           .then(() => {
//             return res.send('-~<| exterminated da shit |>~-')
//           })
//           .catch(error => {
//             return res.send('|>~- da shit wins -~<|')
//           })
//       })
//     })
    
}
