const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const path = require("path");
const dotenv = require('dotenv').config();
const indexRouter = require('./routes/index.cjs');
const authRouter = require('./routes/auth.cjs');
const crypto = require('crypto');
const logger = require('morgan')
const passport = require('passport');
const session = require('express-session');
const mkdirp = require("mkdirp");
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require("cors");
const flash = require("connect-flash");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json())
app.use(flash());

mkdirp.sync('var/db');

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

app.use(session({
    secret: 'bemba',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/get-username', (req, res) => {
    if (req.isAuthenticated()) {
        // User is authenticated, send username
        res.json({ username: req.user.username });
    } else {
        // User is not authenticated
        res.json({ username: null });
    }
});

app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.send('Test route works!');
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use(express.static(path.join(__dirname, './dist')));

const url = 'mongodb+srv://bryanalexsur:9GEoP9o2paCal3EC@cluster0.frj1a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbconnect = new MongoClient(url);

async function run(){
    await dbconnect.connect().then(() => console.log("Connected!"));
    /*const collection = dbconnect.db("LeaderBoard").collection("Accounts");
    let salt = crypto.randomBytes(16);
    let password = crypto.pbkdf2Sync('1234', salt, 310000, 32, 'sha256')
    let newAccount = {"username": "ryan", "hashed_password": password, "salt": salt}
    const results = await collection.insertOne(newAccount);*/
}

const appRun = run();

app.listen(process.env.PORT || 3000, ()=>{
    console.log("port connected");
});