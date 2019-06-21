const express = require("express");
const router = express.Router();

// import models
const Result = require("../models/GlobalVotes");

router.get("/result", (req, res) => {
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
      res.render("result", { lang: table });
    })
    .catch(err => console.log(err));
});

module.exports = router;
