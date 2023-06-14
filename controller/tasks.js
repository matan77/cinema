import express from 'express';
import multer from "multer";
import fs from "fs";
import User from '../models/user.js';
import Movie from '../models/movie.js';
import Seat from '../models/seat.js';
import database from '../models/database.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { UserName, Password } = req.body;
    User.findByPk(UserName).then(user => {
        if (user.Password == Password) {
            req.session.UserName = UserName;
            return res.redirect('/');
        }
        else {
            req.flash('error', 'Invalid username or password. Please try again.');
            return res.redirect('/login');
        }
    }
    ).catch(error => {
        req.flash('error', 'Invalid username or password. Please try again.');
        return res.redirect('/login');
    });
})


router.post('/register', async (req, res) => {
    const { UserName, Password, PasswordCheck } = req.body;
    if (UserName.length == 0 || Password.length == 0) {
        req.flash('error', 'one or more empty fiels');
        return res.redirect('/register');
    }
    else if (Password != PasswordCheck) {
        req.flash('error', 'The password and its confimantion doesn\'t much');
        return res.redirect('/register');
    } else {
        User.create({
            UserName: UserName,
            Password: Password,
            IsAdmin: false
        })
            .then(result => {
                req.session.UserName = UserName;
                return res.redirect('/');
            })
            .catch(error => {
                console.log(error);
                req.flash('error', 'Username has been taken');
                return res.redirect('/register');
            })
    }
})


router.post('/edit_user/:UserName', async (req, res) => {
    const { Password, IsAdmin } = req.body;
    const UserName = req.params.UserName;
    User.update({ Password: Password, IsAdmin: IsAdmin },
        { where: { UserName: UserName } })
        .then(result => {
            console.log(result);
            return res.redirect('/users');
        })
        .catch(error => {
            console.log(error.message);
            return res.redirect('/users');
        })
});

router.post('/delete_user/:UserName', async (req, res) => {
    const UserName = req.params.UserName;
    User.destroy({ where: { UserName: UserName } })
        .then(result => {
            console.log(result)
            return res.redirect('/users')
        })
        .catch(error => {
            console.log(error.message)
            return res.redirect('/users')
        })
});

const upload = multer({
    storage: multer.diskStorage({
        destination: 'public/movies/',
        filename: (req, file, callback) => {
            const filename = req.params.Id + '.jpg';
            callback(null, filename);
        }
    })
});



router.post('/edit_movie/:Id', upload.single('Image'), async (req, res) => {
    const { Name, Price, Datetime } = req.body;
    const Id = req.params.Id;
    Movie.update({ Name, Price, Datetime }, { where: { Id: Id } })
        .then(result => {
            console.log(result);
            return res.redirect('/moveis/' + Id);
        })
        .catch(error => {
            console.log(error.message);
            return res.redirect('/moveis/' + Id);
        })
});

const uploadCreate = multer({
    storage: multer.diskStorage({
        destination: 'public/movies/',
        filename: (req, file, callback) => {
            const { Name, Price, Datetime } = req.body;
            Movie.create({
                Name: Name,
                Price: Price,
                Datetime: Datetime
            })
                .then(result => {
                    const filename = result.Id + '.jpg';
                    callback(null, filename);
                }).catch(error => {
                    console.log(error);
                    return res.redirect('/movies');
                })
        }
    })
});


router.post('/create_movie', async (req, res) => {

    uploadCreate.single('Image')(req, res, err => {
        if (err) {
            console.log(err);
        }
        return res.redirect('/movies');
    })
});

router.post('/delete_movie/:Id', async (req, res) => {
    const Id = req.params.Id;

    Seat.destroy({ where: { movieId: Id } })
        .then(results => {
            Movie.destroy({ where: { Id: Id } })
                .then(result => {
                    fs.access('public/movies/' + Id + '.jpg', fs.constants.F_OK, (err) => {
                        if (err) {
                            console.error(err);
                        }
                        // Delete the file
                        fs.unlink('public/movies/' + Id + '.jpg', (err) => {
                            if (err) {
                                console.error(err);
                            }

                            return res.redirect('/movies');
                        })

                    });
                }).catch(error => {
                    console.log(error.message);
                    return res.redirect('/moveis');
                })
        }).catch(error => {
            console.log(error.message);
            return res.redirect('/moveis');
        })
});


router.post('/create_movie', async (req, res) => {

    uploadCreate.single('Image')(req, res, err => {
        if (err) {
            console.log(err);
        }
        return res.redirect('/movies');
    })
});



router.post('/buy/:movieId', async (req, res) => {
    const movieId = req.params.movieId;
    const { seatsJson } = req.body;
    const seats = JSON.parse(seatsJson);

    if (seats === undefined || seats === null || seats.length == 0) {
        req.flash('error', 'No seats were selected');
        return res.redirect('/buy_tickets/' + movieId);
    }
    try {
        const result = await database.transaction(async (t) => {
            for (let seat of seats) {
                await Seat.create({
                    Row: seat.Row,
                    Column: seat.Column,
                    movieId: movieId
                }, { transaction: t });
            }
        });
        User.findByPk(req.session.UserName).then(
            user => {

                Movie.findByPk(movieId)
                    .then(movie => {
                        req.flash('order',
                            {
                                pageTitle: 'order completed', moment: null, user: user, movie: movie, seats: seats
                            });
                        return res.redirect('/order');
                    });
            });

    } catch (error) {
        console.log(error);
        req.flash('error', 'One or more seats are occupied');
        return res.redirect('/buy_tickets/' + movieId);
    }
});








export default router;