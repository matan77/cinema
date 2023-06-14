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
                pageTitle: 'Matanflix', user: user, movies: movies, moment, error: req.flash('error')
            });
        }).catch(error => {
            res.render('index', {
                pageTitle: 'Matanflix', user: null, movies: movies, moment, error: req.flash('error')
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
    return new Promise((resolve, reject) => {
        let seatsArr = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));

        Seat.findAll({ where: { movieId: movieId } })
            .then(seats => {
                for (let seat of seats) {
                    seatsArr[seat.Row][seat.Column] = 2;
                }
                resolve(seatsArr);
            })
            .catch(error => {
                console.log(error.message);
                reject(error);
            });
    });
};



router.get('/buy_tickets/:Id', async (req, res) => {
    const movieId = req.params.Id;
    getSeats(movieId)
        .then(seatsArr => {
            let isSoldOut = true;
            for (let i = 0; i < seatsArr.length; i++) {
                for (let j = 0; j < seatsArr[i].length; j++) {
                    if (seatsArr[i][j] !== 2) {
                        isSoldOut = false;
                    }
                }
            }
            if (isSoldOut) {
                req.flash('error', 'The tickets are sold out');
                return res.redirect('/')
            }

            Movie.findByPk(movieId)
                .then(movie => {
                    User.findByPk(req.session.UserName).then(
                        user => {
                            res.render('ticketOrder', {
                                pageTitle: 'ticket order', error: req.flash('error'), user: user, moment, movie: movie, seatsArr: seatsArr

                            });
                        })
                        .catch(error => {
                            console.log(error.message)
                            return res.redirect('/')
                        })
                })
        })
        .catch(error => {
            console.error('Error retrieving seats:', error);

        });

});


router.get('/order', async (req, res) => {
    let options = req.flash('order')[0];
    if (!options) {
        return res.redirect('/');
    }
    options.moment = moment;
    res.render('order', options);

});



export default router;