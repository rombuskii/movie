const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose');
const app  = express();
const MongoStore = require('connect-mongo');
const cors = require('cors')
require('dotenv').config();
const User = require('./models/user.model')
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./config/passport')
initializePassport(passport)
const flash = require('express-flash')

const PORT = process.env.PORT || 3001;

mongoose.connect(`mongodb+srv://admin:${process.env.DB_PASSWORD}@showshelf.qvcuviz.mongodb.net/showshelf`)
    .then(console.log("Connection Successful"))
    .catch(e => console.log("Connection failed"));

const sessionStore =  MongoStore.create({
    mongoUrl: `mongodb+srv://admin:${process.env.DB_PASSWORD}@showshelf.qvcuviz.mongodb.net/showshelf`,
    ttl: 14 * 24 * 60 * 60,
    autoRemove: 'native' 
});

app.set('trust proxy', 1)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000']
})
);
app.use(flash())
app.use(session({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    /*cookie: {
        httpOnly: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    }*/
}
));
app.use(passport.initialize());
app.use(passport.session());

//Authentication
const auth = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(401).json("not authenticated");
}

//
/**
 * Routing
 */

app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (info) {
            return res.status(401).json({error: info.msg})
        }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.status(200).send(user);
        });
      })(req, res, next);
})

app.get('/api/user', async(req, res) => {
    //const error = new Error('No user')
        if(req.user) {
            res.send(req.user);
        } else {
            res.status(400).send('No user')
        }
    
})


app.post('/api/register' , async(req, res) => {
    if(req.session.user) {
        res.end()
        return;
    }
    //Add the user to the database
    let {username, password} = req.body
    password = await bcrypt.hash(password, 10);
    await User.create({username, password, admin: false}).catch(() => res.status(500).send('User exists'))
    await User.findOne({username: username}).then(user => {
        const info = {username: user.username, id: user.id}
        req.session.user = info
        req.session.save(err => {
            if(err){
                console.log(err);
            } else {
                res.send(req.session.user)
            }
        })
    })
})

app.get('/api/logout',(req,res) => {
    if(req.user || req.session)
    req.logout((op, done) => {
        console.log('logged out')
    })
});


//

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT} `)
})