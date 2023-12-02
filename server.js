const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose');
const app  = express();
const MongoStore = require('connect-mongo');
const cors = require('cors')
require('dotenv').config();
const User = require('./models/user.model')
const Review = require('./models/review.model')
const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('./config/passport')
const flash = require('express-flash');
const ShowShelf = require('./models/showShelf.model');

const PORT = process.env.PORT || 3001;


mongoose.connect(`mongodb+srv://admin:${process.env.DB_PASSWORD}@showshelf.qvcuviz.mongodb.net/showshelf`)
    .then(console.log("Connection Successful"))
    .catch(e => console.log("Connection failed"));

const sessionStore =  MongoStore.create({
    mongoUrl: `mongodb+srv://admin:${process.env.DB_PASSWORD}@showshelf.qvcuviz.mongodb.net/showshelf`,
    ttl: 14 * 24 * 60 * 60,
    autoRemove: 'native' 
});

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

initializePassport(passport)

app.set('trust proxy', 1)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL]
})
);
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());

//Authentication
const admin = function(req, res, next) {
    console.log(req.session)
    if(req.user && req.user.admin) {
        return next();
    }
    res.status(401).send("Authorization Failed: Require Admin Priveleges");
}
//
/**
 * Routing
 */
const login = (req, res, next) => {
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
}

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


app.post('/api/register' , async(req, res, next) => {
    if(req.session.user) {
        res.end()
        return;
    }
    //Add the user to the database
    let {username, password} = req.body
    password = await bcrypt.hash(password, 10);
    await User.create({username, password, admin: false}).catch(() => res.status(400).send('User already exists'))
    await User.findOne({username: username}).then(user => {
        const info = {username: user.username, id: user.id}
        req.session.user = info
        req.session.save(err => {
            if(err){
                console.log(err);
            } else {
                //res.send(req.session.user)
                login(req,res,next)
            }
        })
    })
})

app.get('/api/review/tv/:id', async(req, res) => {
    const show  = 'tv/' + req.params.id
    const showReview = await Review.findOne({show: show})
    res.json(showReview)
})

app.get('/api/review/movie/:id', async(req, res) => {
    const show  = 'movie/' + req.params.id
    const showReview = await Review.findOne({show: show})
    res.json(showReview)
})

app.get('/api/review/:user', async(req, res) => {
    const user  = req.params.user
    const reviews = await Review.find({"reviews.user": user})
    const cleanReviews = reviews.map(review => {
       let filtered = review.reviews.filter(rev => rev.user === user)
       return {show: review.show, reviews: [...filtered]};
    })

    res.json(cleanReviews)
})

app.put('/api/favorite/tv/:id', async(req, res) => {
    const show  = 'tv/' + req.params.id
    const {username} = req.body;
    if(!username) {
        return res.status(400).send('No user')
    }
    const showshelf = await ShowShelf.findOne({user: username})
    if(!showshelf) {
        await ShowShelf.create({user: username, favorites: [show], ratings: []});

    } else {
        const updatedFavs = showshelf.favorites;
        if(updatedFavs.some(r => r === show)) {
        const filtered = updatedFavs.filter((id) => id !== show);
        await ShowShelf.updateOne({user: username}, { $set: {favorites: filtered}})
        } else {
        updatedFavs.push(show);
        await ShowShelf.updateOne({user: username}, { $set: {favorites: updatedFavs}})
    }
    }
    res.end();
});

app.put('/api/favorite/movie/:id', async(req, res) => {
    const movie  = 'movie/' + req.params.id
    const {username} = req.body;
    if(!username) {
        return res.status(400).send('No user')
    }
    
    const showshelf = await ShowShelf.findOne({user: username})
    if(!showshelf) {
        await ShowShelf.create({user: username, favorites: [movie], ratings: []});
    } else {
        const updatedFavs = showshelf.favorites;
        if(updatedFavs.some(r => r === movie)) {
        const filtered = updatedFavs.filter((id) => id !== movie);
        await ShowShelf.updateOne({user: username}, { $set: {favorites: filtered}})
        } else {
        updatedFavs.push(movie);
        await ShowShelf.updateOne({user: username}, { $set: {favorites: updatedFavs}})
    }
    }
    res.end();
});

app.post('/api/rating/tv/:id', async(req, res) => {
    const show  = 'tv/' + req.params.id
    const {rating, title, username} = req.body;
    if(!username) {
        return res.status(400).send('No user')
    }
    const showshelf = await ShowShelf.findOne({user: username})
    if(!showshelf) {
        await ShowShelf.create({user: username, favorites: [], ratings: [{rating: rating, id: show, title: title}]});
    } else {
        const updatedRatings = showshelf.ratings;
        if(updatedRatings.some(r => r.title === title)) {
            updatedRatings.map((show, i) => {
                if(show.title === title) {
                    show.rating = rating
                }
                return show
            })
        } else {
            updatedRatings.push({rating: rating, id: show, title: title});
        }
        await ShowShelf.updateOne({user: username}, { $set: {ratings: updatedRatings}})
    }
});

app.post('/api/rating/movie/:id', async(req, res) => {
    const movie  = 'movie/' + req.params.id
    const {rating, title, username} = req.body;
    if(!username) {
        return res.status(400).send('No user')
    }
    const showshelf = await ShowShelf.findOne({user: username})
    if(!showshelf) {
        await ShowShelf.create({user: username, favorites: [], ratings: [{rating: rating, id: movie, title: title}]});
    } else {
        const updatedRatings = showshelf.ratings;
        if(updatedRatings.some(r => r.title === title)) {
            updatedRatings.map((movie, i) => {
                if(movie.title === title) {
                    movie.rating = rating
                }
                return movie
            })
        } else {
            updatedRatings.push({rating: rating, id: movie, title: title});
        }
        await ShowShelf.updateOne({user: username}, { $set: {ratings: updatedRatings}})
    }
});

app.get('/api/showshelf/:username', async(req, res) => {
    const {username} = req.params;
    if(!username) {
        return res.status(400).send('No user')
    }
    const showshelf = await ShowShelf.findOne({user: username})
    res.send(showshelf);
})

app.delete('/api/review/movie/:id/:reviewId', async(req,res) => {
    const show  = 'movie/' + req.params.id
    const reviewId = req.params.reviewId
    await Review.updateOne({show: show}, {$pull: {reviews: {_id: reviewId}}})
    res.end();
})

app.get('/api/friends/:username', async(req, res) => {
    const {username} = req.params;
    const user = await User.findOne({username: username})
    res.send(user?.friends);
})

app.delete('/api/review/tv/:id/:reviewId', async(req,res) => {
    const show  = 'tv/' + req.params.id
    const reviewId = req.params.reviewId
    await Review.updateOne({show: show}, {$pull: {reviews: {_id: reviewId}}})
    res.end();
})

app.delete('/api/review/movie/:id/:reviewId', async(req,res) => {
    const show  = 'movie/' + req.params.id
    const reviewId = req.params.reviewId
    await Review.updateOne({show: show}, {$pull: {reviews: {_id: reviewId}}})
    res.end();
})

app.post('/api/review', async(req, res) => {
    const {show, title, user, content} = req.body
    const showReview = await Review.findOne({show: show})
    if (showReview) {
        const reviews = showReview.reviews
        reviews.push({user: user, body: content, title})
        await Review.updateOne({show: show}, { $set: {reviews: reviews}})
        res.status(200);
        res.end()
    } else {
        await Review.create({show: show, reviews: [{user:user, body:content, title}]})
        res.status(200);
        res.end()
    }
})

app.post('/api/friend', async(req, res) => {
   const {friend, username} = req.body
   const user = await User.findOne({username: friend});
   if(!user || (friend === username) || user.friends.includes(username)) {
    res.status(400).send("Invalid input");
    res.end();
    return;
   }
    await User.updateOne({username: friend}, { $push: {friends: username }})
    await User.updateOne({username: username}, { $push: {friends: friend }});
    res.send(200);
})

app.post('/api/password-reset/:username', async(req, res) => {
    const username = req.params.username
    const {password, newPassword} = req.body;
    const user = await User.findOne({username: username})
    const hash = user.password
    const validPassword = await bcrypt.compare(password, hash)
    if(validPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await User.updateOne({username: username}, {$set: {password: hashedPassword}})
        res.status(200).send('Password Updated!')
    } else {
        res.status(400).send('Invaliid Password')
    }
    
})

app.get('/api/users',  async(req, res) => {
    const users = await User.find({});
    res.json(users);
})

app.get('/api/users/:username', async(req, res) => {
    const username = req.params.username
    const users = await User.findOne({username: username})
    res.status(200).json(users)
})

app.get('/api/userlist/:username', async(req, res) => {
    const username = req.params.username
    const regex = new RegExp(`^${username}.*$`, 'i')
    const users = await User.find({username: regex});
    res.status(200).json(users)
})

app.get('*', async(req, res) => {
    res.send('This is the server!')
})

app.post('/api/logout', async(req, res) => {
    req.session.destroy();
    req.logout((op, done) => {
        console.log('logged out')
    })
    req.user = undefined;
    res.send('Logged out');
});

app.put('/api/users/:username', async(req, res) => {
    const { username } = req.params;
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const updatedUser = {...req.body, password: hashedPassword};
    let user = await User.findOne({username: username})
    if(!user) {
        res.status(400).send("User doesn't exist");
    }
    
    let newUser = clone = JSON.parse(JSON.stringify(user));
    await User.updateOne({username: username}, {...newUser, ...updatedUser});
    const users = await User.find({});
    res.json(users);
})

app.delete('/api/users/:username', async(req, res) => {
    const { username } = req.params;
    await User.deleteOne({username: username});
    await ShowShelf.deleteOne({user: username});
    await Review.updateMany({}, {$pull: {reviews: {user: username}}}, {multi: true})
    res.send(200);
})


app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT} `)
})