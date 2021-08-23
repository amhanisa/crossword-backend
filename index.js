const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
const port = 3000;

const data = {
  height: 15,
  width: 15,
  acrossClues: [
    { x: 2, y: 2, length: 4, answer: "ABAD" },
    { x: 5, y: 4, length: 4, answer: "COKI" },
  ],
  downClues: [
    { x: 5, y: 2, length: 3, answer: "ABI" },
    { x: 10, y: 4, length: 8, answer: "LALALALA" },
  ],
};

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
  connection.connect();

  let hasil = [];

  connection.query(`SELECT * FROM hasil`, function (err, rows, fields) {
    if (err) throw err;
    hasil = rows;
    console.log(rows);
  });

  connection.end();
  res.send(hasil);
});

app.post("/submit", (req, res) => {
  console.log(req.body);
  const answer = req.body;
  let nilai = 0;

  //check jawaban
  answer.acrossAnswers.forEach((answer, index) => {
    console.log(answer);
    console.log(data.acrossClues[index].answer);

    if (answer === data.acrossClues[index].answer) {
      nilai++;
    }
  });

  connection.connect();

  connection.query(
    `INSERT INTO hasil (username, score) VALUES ('user',${nilai})`,
    function (err, rows, fields) {
      if (err) throw err;
    }
  );

  connection.end();

  res.send("nilai " + nilai);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
