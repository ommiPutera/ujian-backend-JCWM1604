"use strict";
const express = require("express");
const bearerToken = require("express-bearer-token");
const cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = 2000;
const morgan = require("morgan");

morgan.token("date", function (req, res) {
  return new Date();
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :date")
);

app.use(
  cors({
    exposedHeaders: [
      "Content-Length",
      "x-token-access",
      "x-token-refresh",
      "x-total-count",
    ],
  })
);
app.use(express.json());
app.use(bearerToken());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send({ message: "REST API JCWM1604" })
})

const {
  userRoutes,
  movieRoutes
} = require("./src/routes");

app.use("/user", userRoutes);
app.use("/movies", movieRoutes);

app.all("*", (req, res) => {
  res.status(404).send({ message: "resource not found"});
});

app.listen(PORT, () => console.log(`listen in PORT ${PORT}`));