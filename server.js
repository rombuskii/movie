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
initializePassport(passport)
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
        console.log(filtered)
        await ShowShelf.updateOne({user: username}, { $set: {favorites: filtered}})
        } else {
        updatedFavs.push(show);
        await ShowShelf.updateOne({user: username}, { $set: {favorites: updatedFavs}})
    }
    }
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
        console.log(filtered)
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
    console.log(show)
    const reviewId = req.params.reviewId
    await Review.updateOne({show: show}, {$pull: {reviews: {_id: reviewId}}})
    res.end();
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
    .then(() => User.updateOne({username: username}, { $push: {friends: friend }}));

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

app.get('/api/users/:username', async(req, res) => {
    const username = req.params.username
    const users = await User.find({username: username})
    res.status(200).json(users)
})

app.get('*', async(req, res) => {
    res.send('This is the server!')
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