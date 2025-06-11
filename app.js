const express = require("express");
const logger = require("./utils/logger");
const userRoute = require("./routers/userRoute");
const errorRoute = require("./utils/errorRoute");
const studentRouter = require('./routers/studentRoutes');
const examRouter = require("./routers/examRoute");
const cors = require('cors');
const router = require("./routers/questionRoute");
const resultRouter = require("./routers/resultsRoute");


const app = express();

app.use(cors({
    origin: 'https://resplendent-phoenix-d474fc.netlify.app', // Replace with your frontend URL
    credentials: true, // Allow credentials to be sent

  //   origin: 'http://localhost:5173', // your Netlify frontend URL
  // credentials: true, 

}));

// Middleware to parse JSON request bodies
// app.use(express.json());

//parsing incoming JSON request
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware to log requests
app.use(logger);

app.use('/api/auth', userRoute);


app.use('/api/students', studentRouter);

//exam
app.use('/api/exam', examRouter);

//questions
app.use('/api/questions', router)

app.use('/api/result', resultRouter)

app.get("/", (req, res) => {
    res.send("server is running..")
})


// Middleware to handle 404 errors
app.use(errorRoute);

module.exports = app;