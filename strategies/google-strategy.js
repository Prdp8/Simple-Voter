const GoogleStrategy = require("passport-google-oauth20").Strategy;

// import models
const Voter = require("../models/Voters");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK
} = require("../config/setup");

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK
      },
      function(accessToken, refreshToken, profile, cb) {
        Voter.findOne({ google_id: profile.id })
          .then(voter => {
            if (voter) return cb(null, voter);
            else {
              console.log("new user");
              var newUser = new Voter({
                google_id: profile.id,
                name: profile.name.givenName,
                email: profile.emails[0].value,
                accessToken: accessToken
              });
              newUser
                .save()
                .then(user => {
                  return cb(null, user);
                })
                .catch(err => {
                  throw err;
                });
            }
          })
          .catch(err => {
            return cb(err);
          });
      }
    )
  );

  passport.serializeUser(function(user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });
};
