const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyBh5SX96122TTrs4kgdZ_B1_dFolf_Bdg8",
    authDomain: "mysocial-eb1c1.firebaseapp.com",
    databaseURL: "https://mysocial-eb1c1.firebaseio.com",
    projectId: "mysocial-eb1c1",
    storageBucket: "mysocial-eb1c1.appspot.com",
    messagingSenderId: "1089921528353",
    appId: "1:1089921528353:web:23316bc798e25b761ba960",
    measurementId: "G-VCLK71CZKX"
  };
const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req, res) => {
    db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let screms = [];
        data.forEach( doc => {
            screms.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        })
        return res.json(screms);
    }).catch( error => {
        console.error(error);
    });
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

app.post('/scream', (request, response) => {
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db
    .collection('screams')
    .add(newScream)
    .then( doc => {
        response.json({ message: `document ${doc.id} created successfully`});
    }).catch( err => {
        response.status(500).json({ error: 'something is wrong'});
        console.error(err);
    });
});

// signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }

    //TODO validate data
    db.doc(`/users/${newUser.handle}`).get()
    .then( doc => {
        if (doc.exists) {
            return res.status(400).json({ handle: 'this handle is taken'})
        } else {
            return firebase.
            firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    })
    .then( data => {
        return data.user.getIdToken();
    })
    .then( token => {
        return res.status(201).json({ token: token});
    })
    .catch( error => {
        console.error(error);
        return res.status(500).json({error: error.code});
    });
});

exports.api = functions.https.onRequest(app);
