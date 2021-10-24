module.exports = function(app, passport, db) {

// normal routes ===============================================================
let gameArray = ["green", "red", "black"]


function winner(computerGo, playerGo){
    if(playerGo === computerGo){
return "winner"
    } else {
      return "loser"
    }
}


    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs', {outcome: null})
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          let house = 10000000000000000
          let winsTotal = 0
          let lossTotal = 0
        
          for(let i = 0; i < result.length; i++){
            if(result[i].outcome === "win"){
              house -= result[i].bet
              winsTotal += result[i].bet
            }else {
              house += result[i].bet
              lossTotal += result[i].bet
            }
          }

            res.render('profile.ejs', {
              user : req.user,
              house : house,
              winsTotal : winsTotal,
              lossTotal : lossTotal
            })
          })
      });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    app.post('/', (req, res) => {
      const computerGo = gameArray[Math.floor(Math.random() * gameArray.length)]
      const playerGo = req.body.color

      let result = winner(computerGo, playerGo)

      db.collection('messages').save({outcome: result, bet: parseFloat(req.body.bet) }, (err, savedResult) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.render('index.ejs', {outcome: result, computerGo, playerGo})
      })
    })




// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
