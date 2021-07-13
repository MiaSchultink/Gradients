
const User = require('../models/user');

const bcrypt = require('bcryptjs');

exports.getLogIn = (req, res, next) => {
    res.render('login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
}

// exports.postLogin = (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     User.findOne({ email: email })
//         .then(user => {
//             if (!user) {
//                 return res.redirect('/users/login')
//             }
//             bcrypt.compare(password, user.password).then(doMatch => {
//                 if (doMatch) {
//                     req.session.isLoggedIn = true;
//                     req.session.user = user;
//                     return req.session.save(err => {
//                         console.log(err)
//                         return res.redirect('/')
//                     });
//                 }
//                 res.redirect('/users/login')
//             }).catch(err => {
//                 console.log(err);
//                 res.redirect('users/login')

//             })

//         })
//         .catch(err => console.log(err));
// }

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          return res.redirect('/users/login');
        }
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            res.redirect('/userslogin');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/users/login');
          });
      })
      .catch(err => console.log(err));
  };

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log("logout error", err);
        res.redirect('/');
    });
};

exports.getSignUp = (req, res, next) => {
    res.render('sign-up', {
        pageTitle: 'Sign-up',
        path: '/sign-up',
        isAuthenticated: false
    });
};

exports.postSignUp = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email }).then(userDoc => {
        if (userDoc) {
            return res.redirect('/users/sign-up')
        }
        return bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    gradients: []
                });
                return user.save()
            }).then(result => {
                res.redirect('/users/login')
            });
    })
        .catch(err => {
            console.log(err)
        })

};

exports.getProfile = (req, res, next) => {
    res.render('profile', {
        pageTitle: 'Your profile',
        path: '/profile'
    });
};