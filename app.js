const express = require("express");
const path = require("path")
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieparser = require('cookie-parser');

dotenv.config({ path: "./.env" });

const app = express();
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
// console.log(__dirname);

app.use(express.static(publicDirectory));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieparser());



app.set("view engine", "hbs");

db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("mysql connected")
    }
})

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
    console.log("server started on Port 5000");
});