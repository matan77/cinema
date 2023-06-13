import express from "express";
import User from '../models/user.js';
import Movie from '../models/movie.js';
import Seat from '../models/seat.js';
import moment from 'moment';
import { Op, col } from 'sequelize';
const rows = 2;
const cols = 5;
const router = express.Router();

router.get('/', async (req, res) => {
    Movie.findAll({
        where: {
            Datetime: {
                [Op.gt]: moment()
            }
        }
    }).then(movies => {
        User.findByPk(req.session.UserName).then(user => {
            res.render('index', {
                pageTitle: 'Matanflix', user: user, movies: movies, moment
            });
        }).catch(error => {
            res.render('index', {
                pageTitle: 'Matanflix', user: null, movies: movies, moment
            });
        });

    });
});

router.get('/movies', async (req, res) => {
    User.findByPk(req.session.UserName).then(user => {
        Movie.findAll().then(movies => {
            if (user && user.IsAdmin) {
                res.render('movies', {
                    pageTitle: 'Matanflix movies', user: user, movies: movies, moment
                });
            }
        })
    }).catch(error => {
        res.render('index', {
            pageTitle: 'Matanflix', username: null
        });
    });
})

router.get('/users', async (req, res) => {
    User.findByPk(req.session.UserName).then(user => {
        User.findAll().then(users => {
            if (user && user.IsAdmin) {
                res.render('users', {
                    pageTitle: 'Matanflix users', user: user, users: users
                });
            }
        })
    }
    ).catch(error => {
        res.render('index', {
            pageTitle: 'Matanflix', username: null
        });
    });
})

router.get('/login', async (req, res) => {
    res.render('login', {
        pageTitle: 'login', error: req.flash('error')
    })
})

router.get('/register', async (req, res) => {
    res.render('register', {
        pageTitle: 'register', error: req.flash('error')
    })
})



router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


router.get('/users/:UserName', async (req, res) => {
    const UserName = req.params.UserName;
    User.findByPk(UserName)
        .then(editUser => {
            User.findByPk(req.session.UserName).then(
                user => {
                    res.render('user', {
                        pageTitle: 'edit ' + editUser.UserName, error: req.flash('error'),
                        user: user,
                        editUser: editUser
                    })
                }
            )

        })
        .catch(error => {
            console.log(error.message)
            return res.redirect('/users')
        })
});

router.get('/moveis/:Id', async (req, res) => {
    const Id = req.params.Id;
    User.findByPk(req.session.UserName).then(
        user => {
            Movie.findByPk(Id)
                .then(movie => {
                    res.render('movieEdit', {
                        pageTitle: 'edit ' + movie.Name, error: req.flash('error'),
                        movie: movie, user: user, moment
                    });
                })
        })
        .catch(error => {
            console.log(error.message)
            return res.redirect('/movies')
        })
});

router.get('/add_movie/', async (req, res) => {
    User.findByPk(req.session.UserName).then(
        user => {
            res.render('movieAdd', {
                pageTitle: 'add movie', error: req.flash('error'), user: user, moment
            });
        })
        .catch(error => {
            console.log(error.message)
            return res.redirect('/movies')
        })
});

const getSeats = (movieId) => {
    const seatsArr = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
    console.log(seatsArr);
    Seat.findAll({ where: { movieId: movieId } }).then(
        seats => {
            for (seat of seats) {
                seatsArr[seat.Row][seat.col] = 2;
            }
        }
    )
    return seatsArr;
};


router.get('/buy_tickets/:Id', async (req, res) => {
    const movieId = req.params.Id;
    Movie.findByPk(movieId)
        .then(movie => {
            User.findByPk(req.session.UserName).then(
                user => {
                    res.render('ticketOrder', {
                        pageTitle: 'ticket order', error: req.flash('error'), user: user, moment, movie: movie, seatsArr: getSeats(movieId)

                    });
                })
                .catch(error => {
                    console.log(error.message)
                    return res.redirect('/')
                })
        })
});


export default router;