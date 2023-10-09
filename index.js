const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//START POINT
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO_URL)
const Schema = mongoose.Schema;


const UserSchema = new Schema({
  username: { type: String, required: true },
})
const UserModel = mongoose.model("UserModel", UserSchema)

const ExerciseSchema = new Schema({
  username: { type: String },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String }
})
const ExerciseModel = mongoose.model("ExerciseModel", ExerciseSchema)

//insert new user
app.post("/api/users", (req, res) => {
  const userNameInput = req.body.username;
  const newUser = new UserModel({
    username: userNameInput
  })
  newUser.save()
    .then(U =>res.json({username:U.username, _id:U._id}))
    .catch(err => { console.error(`User error: ${err}`) })
})
//Get All Users
app.get("/api/users", (req, res) => {
  UserModel.find()
    .then(User => { res.json(User) })
    .catch(err => { console.log(`Find User Error: ${err}`) })
})
//Insert New Exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;
  let userName;
  const userDescription = req.body.description;
  const userDuration = req.body.duration;
  let userDate = new Date(req.body.date).toDateString();
  if (isNaN(Date.parse(userDate))) { userDate = new Date().toDateString() }
  await UserModel.findById(userId)
    .then(user => userName = user.username)
    .catch(err => console.log(`didn't find the username Error: ${err}`))
  const newExercise = new ExerciseModel({
    username: userName,
    description: userDescription,
    duration: Number(userDuration),
    date: userDate
  })
  newExercise.save()
    .then(exercise => { res.json({_id:userId,username:userName,date:userDate,duration:Number(userDuration),description:userDescription}) })
    .catch(err => console.log(`New Exercise Error: ${err}`))

})
//Get User Logs
app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  let userName;
  let count;
  let log=[];
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const limit = parseInt(req.query.limit);
  await UserModel.findById(userId)
    .then(user => { userName = user.username })
    .catch(er => `Fidn't Find The User Error1 : ${err}`)
  if (userName) {
    await ExerciseModel.countDocuments({ username: userName })
      .then(c => count = c)
      .catch(err => console.error('Error counting documents:', err))
    await ExerciseModel.find({ username: userName })
      .limit(limit)
      .then(exercise => {
        if(fromDate && toDate){
          ExerciseModel.find({
    date: {
        $gte: new Date(fromDate), 
        $lte: new Date(toDate)
    },username:userName})
          .then(ex=>{res.json({
          usernam: userName,
          count: count,
          _id: userId,
          log: exercise.map(ex => ({
            description: ex.description,
            duration: ex.duration,
            date: ex.date,
          }))
        })})
          .catch(err=>console.log("find By Time Error:"+err))
        }else{
          res.json({
          usernam: userName,
          count: count,
          _id: userId,
          log: exercise.map(ex => ({
            description: ex.description,
            duration: ex.duration,
            date: ex.date,
          }))
        })
        }
        
      })
  }


  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
