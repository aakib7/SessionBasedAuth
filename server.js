const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require("mongoose");""
const mongodbSession = require('connect-mongodb-session')(session);
const User = require('./Models/User');
const isAuth = require('./middleware/isAuth');


const mongoURI = "mongodb://127.0.0.1:27017/sessions";

mongoose.connect(mongoURI).then(res=>{
  console.log("Connected");
});

const store = new mongodbSession({
    uri : mongoURI,
    collection: "mySessions",
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // for url encode and give us data in body obj

app.use(session({
    secret:"key",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
    store : store,
}));


//=================== Routes
// Landing Page
app.get('/', function(req, res) {
    // req.session.isAuth = true;
    // console.log(req.session);
    res.render('home');
});

// Login
app.get('/login', async(req, res)=>{
    res.render('login');
});

app.post('/login', async(req, res)=>{
    const{email,password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.redirect('/login'); 
    }
    else{
        if(user.password === password){
            req.session.isAuth = true;
            res.redirect('/profile');
        }
        else{
            return res.redirect('/login');
        }
    }
    
});


// Register
app.get('/register', async(req, res)=>{
    res.render('register');
});

app.post('/register', async(req, res)=>{
    const{username,email,password} = req.body;
    let user = await User.findOne({email});
    if(user){
        return res.redirect('/register');
    }
    else{
        user = new User({
            username,
            email,
            password, //encrypte password with bycript
        });
        await user.save();
        res.redirect('/login');
    }
    
});


// Profile
app.get('/profile', isAuth, async(req, res)=>{
    res.render('profile');
});

// logout
app.post('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err) {
            throw err;}
        else{
            res.redirect('/');
        }
    });

});

app.listen(4000);