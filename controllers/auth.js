const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const passwordValidator = require('password-validator');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'user-data'
});

const schema = new passwordValidator();

schema.is().min(8).is().max(20).has().letters(1).has().digits(1).has().symbols(1);

exports.register = (req, res) => {
    // console.log(req.body);
    const username = req.body.username;
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mob;
    const address = req.body.address;
    const password = req.body.pass;
    const passwordconfirm = req.body.passconf;

    let check = schema.validate(password);
    if (!check) {

        return res.render('register', {
            message: 'should contain min 8 character <br> contain Number,alphabat and atleast one character'
        })
    }
    db.query('SELECT email FROM users WHERE email = ?', [email], async(error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.render('register', {
                message: 'this email already in use'
            })
        } else if (password !== passwordconfirm) {
            return res.render('register', {
                message: 'password do not match'
            });

        }
        // console.log(password);
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword, username: username, mobile: mobile, address: address }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                return res.render('register', {
                    message: 'User registered'
                });
            }
        });

    });
}

exports.login = async(req, res) => {
    try {
        // const { email, password } = req.body.email;
        const email = req.body.email;
        const password = req.body.pass;

        if (!email || !password) {
            return res.status(400).render('login', {
                message: "Please provide an email and password"
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async(error, results) => {
            const hp = results[0].password;

            if (!results || !(await bcrypt.compare(password, hp))) {
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                })
            } else {
                const id = results[0].id;
                const name = results[0].name;
                const username = results[0].username;
                const email = results[0].email;
                const mobile = results[0].Mobile;
                const address = results[0].Address;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('login', token, cookieOptions);
                res.status(200).render("index", { name: name, email: email, username: username, mobile: mobile, address: address });
            }
        })

    } catch (error) {
        console.log(error);
    }
}