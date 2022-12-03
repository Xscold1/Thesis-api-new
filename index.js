const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const initializedDb = require("./utils/db-initializer");
const path = require("path");
const importModels = require('./src/app/models/initializeModels');
const app = express();
require('dotenv').config()
importModels(); // We just need this to create table even the models are not exported in the Controllers
//Initialize Database and Tables

// app.use((req, res, next) => {
//   // initializedDb;
//   next();
// });

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://lobster-app-nmiq3.ondigitalocean.app"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Middlewares
app.use(express.json());
//app.use(cors());
app.use(cookieParser());

app.use(cors()) // Use this after the variable declaration
// To serve the public files like images, files, etc.
app.use(express.static("public"));
app.use("/public", express.static(path.join(__dirname, 'public')));
// app.use(express.static('./build'));





//Routes
const user = require("./src/app/routes/user/user");
const symptomChecker = require("./src/app/routes/symptom-checker/symptom-checker");
const doctor = require("./src/app/routes/doctor/doctor");
const dataset = require("./src/app/routes/dataset/dataset");
const analytics = require('./src/app/routes/analytics/analytics')
const disease = require("./src/app/routes/disease/disease");
const hospital = require("./src/app/routes/hospital/hospital");
const admin = require("./src/app/routes/admin/admin");

const authenticate = require("./src/app/routes/authenticate/authenticate");
const { METHODS } = require("http");




//Routes and Controller Middleware
app.use("/api/user", user);
app.use("/api/symptom-checker", symptomChecker);
app.use("/api/doctor", doctor);
app.use("/api/dataset", dataset);
app.use("/api/analytics", analytics);
app.use("/api/disease", disease);
app.use("/api/hospital", hospital);
app.use("/api/admin", admin);
app.use("/api/authenticate", authenticate);
// app.use(express.static(path.join(__dirname, "./dist")));
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./dist", "index.html"));
// });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});
