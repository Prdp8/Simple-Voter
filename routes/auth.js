const express = require("express");
const router = express.Router();
const passport = require("passport");

// import models
const Voter = require("../models/Voters");
const Result = require("../models/GlobalVotes");

const { ensureAuthenticated } = require("../helper/authenticate");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/vote",
    failureRedirect: "/auth/err"
  })
);

router.get("/vote", ensureAuthenticated, (req, res) => {
  Voter.findOne({ google_id: req.user.google_id })
    .then(voter => {
      if (voter.isVoted) {
        Result.find()
          .then(result => {
            var num = 0;
            var table = result.map(obj => {
              return {
                id: ++num,
                language: obj.language,
                votes: obj.votes
              };
            });
            res.render("result", {
              name: req.user.name,
              lang: table,
              votedfor: voter.votedFor
            });
          })
          .catch(err => console.log(err));
      } else res.render("vote", { name: req.user.name });
    })
    .catch(err => console.log(err));
});

router.post("/vote", (req, res) => {
  //update globalResult table
  Result.findOne({ language: req.body.key })
    .then(result => {
      if (result) {
        Result.findOneAndUpdate(
          { language: req.body.key },
          { votes: parseInt(result.votes) + 1 }
        )
          .then(rowAffected => console.log(rowAffected))
          .catch(err => console.log(err));
      } else {
        var newEntry = new Result({
          language: req.body.key,
          votes: 1
        });
        newEntry
          .save()
          .then(user => console.log(user))
          .catch(err => {
            throw err;
          });
      }
      //update Voter table => votedfor and isvoted column
      Voter.findOne({ google_id: req.user.google_id })
        .then(voter => {
          Voter.findOneAndUpdate(
            { google_id: req.user.google_id },
            { isVoted: true, votedFor: req.body.key }
          )
            .then(rowAffected => console.log(rowAffected))
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  res.render("result", {
    msg: `Congrats !! ${req.user.name}`,
    votedfor: req.body.key
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/auth/err", (req, res) => res.send("error"));

module.exports = router;
