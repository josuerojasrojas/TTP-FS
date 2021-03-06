const functions = require('firebase-functions');
const newUserHandler = require('./newUsers.js');
const deleteUserHandler = require('./deleteUser.js');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.database();


// create new user functions
exports.newUser = functions.auth.user().onCreate((user)=>{
  newUserHandler(user, db);
})

// delete user data when delete user
exports.deleteUserData = functions.auth.user().onDelete((user)=>{
  deleteUserHandler(user, db);
})


const express = require('express');
const app = express();
const cors = require('cors')({origin: true});
const validateFirebaseIdToken = require('./validate.js');
const sellTransaction = require('./selltransaction.js');
const buyTransaction = require('./buyTransaction.js');
const bodyParser = require('body-parser');
app.use(cors);
app.use( bodyParser.json() );
app.use((req, res, next)=>{
  validateFirebaseIdToken(req, res, next, admin);
});

app.get('/user/money', (req, res)=>{
  const uid = req.user.uid;
  db.ref(`usersData/${uid}/money`).once('value')
    .then((dataSnapshot)=>{
      if(!dataSnapshot.val() && dataSnapshot.val() !== 0) {
        return res.status(400).json({status: "error", message: "no data found"});
        // should set money if there isnt for some reason
      }
      return res.send({money: dataSnapshot.val()});
    })
    .catch((err)=> res.status(500).json({status: "error", error: err}));
});

app.get('/user/transactions', (req, res)=>{
  const uid = req.user.uid;
  db.ref(`transactionHistory/${uid}`).once('value')
    .then((dataSnapshot)=>{
      if(!dataSnapshot.val()) {
        return res.status(400).json({status: "error", message: "no data found"});
      }
      return res.send(dataSnapshot.toJSON());
    })
    .catch((err)=>res.status(500).json({status: "error", error: err}));
});

app.get('/user/holding', (req, res)=>{
  const uid = req.user.uid;
  db.ref(`stocksHolding/${uid}`).once('value')
    .then((dataSnapshot)=>{
      if(!dataSnapshot.val()){
        return res.status(400).json({status: "error", message: "no data found"});
      }
      return res.send(dataSnapshot.toJSON());
    })
    .catch((err)=> res.status(500).json({status: "error", error: err}));
});

app.post('/user/transactions/buy', (req, res)=>{
  return buyTransaction(req, res, db);
});

app.post('/user/transactions/sell', (req, res)=>{
  return sellTransaction(req, res, db);
});


// endpoints
exports.app = functions.https.onRequest(app);
