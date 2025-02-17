const express = require('express');
const app = express();
const passport = require('passport');
const dotenv = require('dotenv').config();
const GitHubStrategy = require('passport-github');
const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
const cors = require("cors");
const path = require("path");

const router = express.Router();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
    MONGO_USER,
    MONGO_PASS,
    MONGO_HOST,
    MONGO_DBNAME,
    MONGO_DBCOLLECTION,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    EXPRESS_SESSION_SECRET
} = process.env;

const url = 'mongodb+srv://bryanalexsur:9GEoP9o2paCal3EC@cluster0.frj1a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbconnect = new MongoClient(url);
let collection = null;

passport.use(new GitHubStrategy({
        clientID: 'Ov23lij1bsk7SorBLz4i',
        clientSecret: '07de48cca495bdd316c8c887a15bddef62801159',
        callbackURL: "http://a4-bsuria.glitch.me/auth/github/callback"
    },
    async function (accessToken, refreshToken, profile, done) {
        // This code will run when the user is successfully logged in with GitHub.
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

passport.serializeUser(function(user, done) {
    process.nextTick(function() {
        done(null, { username: user.username, id: user._id || user.id });
    });
});

passport.deserializeUser(function(obj, done) {
    process.nextTick(function() {
        done(null, obj);
    });
});

app.get("/login", (req, res) => {
    console.log("ran login");
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.get('/auth/github/callback',
    passport.authenticate('github', { session: true, failureRedirect: '/login', failureFlash: true }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

app.get('/auth/github', passport.authenticate('github', { scope: ['user:username'] }));

app.get('/signout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        return res.redirect('/login');
    });
});

module.exports = app;