const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
const port = 3000;

const data = require("./data.json");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crossword",
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/score", (req, res) => {
  connection.query(
    `SELECT * FROM hasil WHERE score is not null ORDER BY score DESC, time ASC LIMIT 10`,
    function (err, rows, fields) {
      console.log(rows);
      res.send(rows);
    }
  );
});

app.post("/checkUsername", (req, res) => {
  console.log(req.body);

  connection.query(
    `INSERT INTO hasil (username) VALUES ('${req.body.username}')`,
    function (err, rows, fields) {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ success: false, message: "query error", error: err });
      } else {
        res.status(200).send(req.body.username);
      }
    }
  );
});

app.post("/submit", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const answers = req.body.answers;
  let score = 0;

  //check jawaban
  answers.acrossAnswers.forEach((answer, index) => {
    console.log(answer.toLowerCase());
    console.log(data.acrossClues[index].answer.toLocaleLowerCase());

    if (answer.toLowerCase() === data.acrossClues[index].answer.toLowerCase()) {
      score++;
    }
  });

  answers.downAnswers.forEach((answer, index) => {
    console.log(answer.toLowerCase());
    console.log(data.downClues[index].answer.toLocaleLowerCase());

    if (answer.toLowerCase() === data.downClues[index].answer.toLowerCase()) {
      score++;
    }
  });

  connection.query(
    `UPDATE hasil SET score=${score}, time=now() WHERE username='${username}'`,
    function (err, rows, fields) {
      if (err) throw err;
    }
  );

  res.send("nilai " + score);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
