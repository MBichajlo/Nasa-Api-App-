import express from "express";

import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv/config";

import { getMaxAndMinDate } from "./rovers.js";
import { Rover } from "./rovers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

const spirit = new Rover("Spirit", "2004-01-04", "2010-03-21");
const opportunity = new Rover("Opportunity", "2004-01-25", "2018-06-11");

const lowestPossibleDate = "2004-01-04";
// Normally there would be an apiCall on start of the server and with some intervals, but it's too time consuming so i'll just hardcode the maximum dates for now
// const apiResult = await getMaxAndMinDate();

//For development purpose only ***
const perseverance = new Rover("Perseverance", "2021-02-18", "2024-04-01");
const curiosity = new Rover("Curiosity", "2012-08-06", "2024-02-19");
//****
const rovers = [spirit, opportunity, perseverance, curiosity];

app.get("/", async (req, res) => {
  res.render("index.ejs", {
    // rovers: rovers,
    // highestPossibleDate: apiResult.maxDate,
    highestPossibleDate: "2024-04-01",
  });
});

app.post("/submit", async (req, res) => {
  console.log(req.body.date);
  //Checking which rovers are available for this day
  let possibleRovers = rovers.filter(
    (r) =>
      r.latestPossibleDate > req.body.date &&
      r.earliestPossibleDate < req.body.date
  );
  console.log(possibleRovers);
  var photo = "";

  //api calls for each possible rover to determine if any of them took any photos on a given date
  for (const r of possibleRovers) {
    try {
      const nasaResponse = await axios.get(
        `http://mars-photos.herokuapp.com/api/v1/rovers/${r.name}/photos?earth_date=${req.body.date}&camera=fhaz`
      );
      console.log(nasaResponse.data);
      if (nasaResponse.data.photos.length != 0) {
        photo =
          nasaResponse.data.photos[
            Math.floor(Math.random() * nasaResponse.data.photos.length)
          ];
        break;
      }
    } catch (error) {}
  }
  console.log(photo.rover);
  res.render("photo.ejs", {
    photo: photo,
  });
});

app.listen(port, () => {
  console.log(`Server up and running on port: ${port}`);
});