const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const dotenv = require('dotenv').config();
const cors = require("cors");
const path = require("path");
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const ensureLoggedIn = ensureLogIn();

const router = express.Router();

app.use(express.json())

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

async function fetchAllData(callback) {
    collection = dbconnect.db("LeaderBoard").collection("Stats");
    const data = await collection.find({}).toArray()
    callback(null, data);
}

app.get("/app", (req, res, next) => {console.log("Checking user authentication");
    if (!req.user) {
        console.log("Redirecting to /login");
        return res.redirect('/login');
    }
    next();
}, function(req, res, next) {
    res.sendFile(path.join(__dirname, '../dist', "index.html"));
});

app.get("/", (req, res, next) => {
    console.log("Checking user authentication");
    if (!req.user) {
        console.log("Redirecting to /login");
        return res.redirect('/login');
    }
    next();
}, function(req, res, next) {
    res.redirect('/app');
});

app.post('/initialize', ensureLoggedIn, function(req, res, next) {
    fetchAllData(function (err, data) {
        if (err) {
            console.log("data not collected")
        }

        let addingdata = ''
        console.log(data.length)

        //console.log(data)

        return res.json({
            message: 'Data recovered',
            dataRecovered: data
        });
    });
});

app.post('/submit', ensureLoggedIn, function(req, res, next) {
    console.log(req.body.startdate)
    console.log(req.body)

    const startTime = new Date(req.body.startdate)/(3600*1000);
    const currentTime = Date.now()/(3600*1000)
    const hoursPerDay = Math.round(Number(req.body.playtime)/((currentTime - startTime)/24))

    console.log(Number(req.body.playtime))
    console.log(hoursPerDay)

    const json = { id: req.body.id, name: req.body.name,
        gamename: req.body.gamename, playtime: req.body.playtime,
        startdate: req.body.startdate, hours: hoursPerDay }

    console.log('RunningServer');
    collection = dbconnect.db("LeaderBoard").collection("Stats");
    collection.insertOne(json).then(r => {
        console.log("data added");
        return res.json({
            message: 'Data inserted',
            insertedData: json
        });
    })
});

app.post('/update', ensureLoggedIn, function(req, res, next) {
    console.log(req.body.jsonNew)
    console.log(req.body)

    const startTime = new Date(req.body.jsonNew.startdate)/(3600*1000);
    const currentTime = Date.now()/(3600*1000)
    const hoursPerDay = Math.round(Number(req.body.jsonNew.playtime)/((currentTime - startTime)/24))

    console.log(Number(req.body.jsonNew.playtime))
    console.log(hoursPerDay)

    const json = { name: req.body.jsonNew.name, gamename: req.body.jsonNew.gamename, playtime: req.body.jsonNew.playtime,
        startdate: req.body.jsonNew.startdate, hours: hoursPerDay }

    console.log(req.body.jsonOld);
    collection = dbconnect.db("LeaderBoard").collection("Stats");
    collection.updateOne(req.body.jsonOld,{$set: json}).then(r => {
        console.log("data updated");
        return res.json({
            message: 'Data updated',
            insertedData: json
        });
    })
});

app.post('/delete', ensureLoggedIn, function(req, res, next) {
    const json = req.body
    console.log(req.body)
    collection = dbconnect.db("LeaderBoard").collection("Stats");
    collection.deleteOne(json).then(r => {
        console.log("data deleted");
        return res.json({
            message: 'Data deleted',
        });
    })
});

module.exports = app;