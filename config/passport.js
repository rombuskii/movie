const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.model')
const bcrypt = require('bcrypt')



function initialize(passport) {
const verifyCallback = async (username, password, done) => {
    User.findOne({ username: username})
    .then(async (user) => {
        if(!user) {return done(null, false, {message: 'No user with given username'})}
        if(await bcrypt.compare(password, user.password)) {
            return done(null, user)
        } else {
            return done(null, false, {message: 'Password incorrect'})
        }
    })
    .catch((err) => {
        done(err);
    })
}

passport.use(new LocalStrategy({usernameField: 'username', passwordField: 'password'}, verifyCallback));

passport.serializeUser((user, done) => {
    return done(null, user); 
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        return done(null, user);
    })
});
}

module.exports = initialize