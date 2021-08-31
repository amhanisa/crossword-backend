require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
const port = process.env.PORT;

const data = require("./data.json");

const pool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.use(cors());
app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/getCrossword", (req, res) => {
  let crosswordData = JSON.parse(JSON.stringify(data));
  crosswordData.acrossClues.forEach((clue) => {
    delete clue.answer;
  });
  crosswordData.downClues.forEach((clue) => delete clue.answer);

  res.send(crosswordData);
});

app.get("/score", (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM hasil WHERE score is not null ORDER BY score DESC, time ASC LIMIT 10`,
      function (err, rows, fields) {
        console.log(rows);
        res.send(rows);
        connection.release();
      }
    );
  });
});

app.get("/winner", (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(
      `SELECT * FROM hasil WHERE score is not null ORDER BY score DESC, time ASC`,
      function (err, rows, fields) {
        console.log(rows);
        res.send(rows);
        connection.release();
      }
    );
  });
});

app.post("/checkUsername", (req, res) => {
  console.log(req.body);

  pool.getConnection((err, connection) => {
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
        connection.release();
      }
    );
  });
});

app.post("/cleanDatabase", (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(`TRUNCATE TABLE hasil;`, function (err, rows, fields) {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ success: false, message: "query error", error: err });
      } else {
        res.status(200).send(req.body.username);
      }
      connection.release();
    });
  });
});

app.post("/submit", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const answers = req.body.answers;
  let score = 0;

  //check jawaban
  answers.acrossAnswers.forEach((answer, index) => {
    console.log(answer.toLowerCase());
    console.log(data.acrossClues[index].answer.toLowerCase());

    if (answer.toLowerCase() === data.acrossClues[index].answer.toLowerCase()) {
      score++;
    }
  });

  answers.downAnswers.forEach((answer, index) => {
    console.log(answer.toLowerCase());
    console.log(data.downClues[index].answer.toLowerCase());

    if (answer.toLowerCase() === data.downClues[index].answer.toLowerCase()) {
      score++;
    }
  });

  pool.getConnection((err, connection) => {
    connection.query(
      `UPDATE hasil SET score=${score}, time=now() WHERE username='${username}'`,
      function (err, rows, fields) {
        if (err) throw err;
        connection.release();
      }
    );
  });

  res.send("nilai " + score);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
