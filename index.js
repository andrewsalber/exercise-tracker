const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config({path: './sample.env'})
var mongoose = require("mongoose");
const bodyParser = require("body-parser");

console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});

const ExerciseSchema = new mongoose.Schema({
  userID: { type: String, required: true},
  description: String,
  duration: Number,
  date: Date
})

const UserSchema = new mongoose.Schema({
  username: String
})

const User = mongoose.model("User", UserSchema)
const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  console.log('req.body', req.body)
  const newUser = new User({
    username: req.body.username
  })
  newUser.save((err,data) => {
    if (err || !data) {
      res.send("There was an error saving the user.")
    } else {
      res.json(data);
    }
  })
});

app.post('/api/users/:_id/exercises', (req,res) => {
  const id = req.params._id;
  const {description, duration, date} = req.body

  User.findById(id, (err, userData) => {
    if (err || !userData) {
      res.send("Could not find user")
    } else {
      if (date) {
        parsedDate = new Date(date);
      } else {
        parsedDate = new Date();
      }
      //console.log("date:", date, "parsedDate:", parsedDate)
      const newExercise = new Exercise( {
        userID: id,
        description,
        duration,
        date: parsedDate
      })
      newExercise.save((err,data) => {
        if (err || !data) {
          res.send("There was an error saving the exercise")
        } else {
          res.send({
            _id: data.userID,
            username: userData.username,
            date: data.date.toDateString(),
            duration: parseInt(duration),
            description
          });
        };
      });
    };
  })
})

app.get('/api/users', (req,res) => {
  User.find({}, (err,data)=> {
    if (err || !data) {
      res.send("no users found")
    } else {
      res.json(data);
    }
  });
});

app.get('/api/users/:_id/logs', (req,res) => {
  //onsole.log(req.params);
  const id = req.params._id;
  User.findById(id,(err, data) => {
    let userName = data.username;
    Exercise.find({userID: id}, (err, data) => {
      console.log(data);
      if (err || !data) {
        res.send("could not retreive user exercises")
      } else {
        let parsedData = data.map((obj) => {
          return {
            "description": obj.description,
            "duration": obj.duration,
            "date": obj.date.toDateString()
          }
        })
        console.log({
          "username": userName,
          "count": data.length,
          "_id": id,
          "log": parsedData
        })
        res.send(
          {
            "username": userName,
            "count": data.length,
            "_id": id,
            "log": parsedData
          }
        );
      };
    });
  });
});
  

//62e7223e0206e738d459cf6a

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
