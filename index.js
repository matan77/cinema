import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "express-flash";
import dotenv from "dotenv";
import crypto from "crypto";
import database from './models/database.js';
import actionRoutes from './controller/actions.js';
import tasksRoutes from './controller/tasks.js';
import User from './models/user.js';
dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
}

app.use(cookieParser());
app.use(session({
    secret: generateSecretKey(),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
    }
}));
app.use(flash());

app.use((req, res, next) => {
    if (req.session.UserName) {
        User.findByPk(req.session.UserName).then(user => {
            if (user) {
                next();
            } else {
                res.redirect('/');
            }
        }).catch(error => {
            console.error(error);
            res.redirect('/');
        })

    }
    else if (
        req.path !== '/' &&
        req.path !== '/login' &&
        req.path !== '/register' &&
        req.path !== '/functions/login' &&
        req.path !== '/functions/register'
    ) {
        res.redirect('/login');
    }
    else {
        next();
    }
});
app.use("/", actionRoutes);
app.use("/functions/", tasksRoutes);


app.use((req, res, next) => {
    res.status(404).render('404', {
        pageTitle: '404',
    });
});

database.sync()
    .then(res => {
        app.listen(process.env.PORT, () => { console.log(`Server is running via port ${process.env.PORT}`) });
    })

    .catch(err => {
        console.log(err);

    });