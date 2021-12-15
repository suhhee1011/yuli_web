// Author: Yuli Kim
// Student Number: 160437174
// WEB322NGG
// Date: Nov 14, 2021

//   herokuapp
// https://yuli174a5.herokuapp.com/
//   github
// https://github.com/ykim232/web_as5 



const express = require('express');
const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/resource"));
const multer = require('multer')
const path = require("path");

const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const seq = require('sequelize');

const { check, validationResult } = require('express-validator');
const urlencodedParser = bodyParser.urlencoded({ extended: false });  // TODO

app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server started on port ' + port);
})

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, callback) => {
        callback(null, Date.now() + path.extname(file.originalname));
    }
});
const uploader = multer({ storage: storage });

app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

const sequelize_obj = new seq(
    "dafn0es1cj4lfv", // Database Name
    "rpmxziuorkjaho", // Username
    "b40b047d19a5d2e19d0d45e865b8a9f06600324ac7926a1e09c29cec4dada740", // Password
    {
        host: "ec2-52-201-195-11.compute-1.amazonaws.com",
        dialect: 'postgres', // What kind of DB system we are working with.
        port: 5432,
        dialectOptions: { ssl: { rejectUnauthorized: false } } // Secure Protocol
    }
)

const userAccount = sequelize_obj.define(
    "account",
    {
        userID: {
            type: seq.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: seq.STRING,
        password: seq.STRING,
        email: {
            type: seq.STRING,
            allowNull: false,
            unique: true
        },
        phonenum: seq.INTEGER,
        company: seq.STRING,
        street: seq.STRING,
        address: seq.STRING,
        city: seq.STRING,
        state: seq.STRING,
        zip: seq.STRING,
    },
    {
        createAt: false,
        updateAt: false
    }
);

const plans = sequelize_obj.define(
    "package",
    {
        planName: {
            type: seq.STRING,
            allowNull: false,
            primaryKey: true,
        },
        planPrice: {
            type: seq.NUMBER,
            allowNull: false
        },
        planDetail: seq.STRING,
        featureList: seq.JSON,          // TODO
    },
    {
        createAt: false,
        updateAt: false
    }
);

//////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    let data = {};
    res.render("home", { data: data});
});

app.get('/home', (req, res) => {
    let data = {};
    res.render("home", { data: data });
});

app.get('/createPlan', (req, res) => {
    let data = {};
    res.render("home", { data: data });
});
app.get('/login', (req, res) => {
    let data = {};
    res.render("login", { data: data });
});
const special_pattern = /[~!@#$%^&*()_+|<>?:{}]/gi;
app.post('/login', urlencodedParser, [

    check('name', 'Name is required.')
        .exists()
        .matches(special_pattern)
        .withMessage('Special character is not allowed.')
        .matches(/\s/)
        .withMessage('space is not allowed.'),

    check('email', 'Email is required.')
        .exists(),

], (req, res) => {
    let _name = req.body.name;
    let _email = req.body.email;
    let customerID = 1;                //TODO

    const errors = validationResult(req);

    let data = {
        values: {
            name: _name,
            email: _email
        },
        errors: {
            name: "",
            email: "",
            error: ""
        }
    };

    if (!errors.isEmpty()) {
        var alert = errors.array();
        res.render('login', { alert: alert, data: data, layout: false });
    } else {
        userAccount.findAll({
            attributes: ["name", "email"],
            where: {
                name: _name,
                email: _email
            },
            order: ["name"]
        }).then((obj) => {
            let data = obj.map(value => value.dataValues); // What is this for?
            if (data.isEmpty) {
                data.errors.error = " Sorry, you entered the wrong email and/or password";
            }
            res.render("dashboard", { data: data});
        });
    }
});

const number = "/[0-9]/";
const letter = "/[a-zA-Z]/";
app.get('/registration', (req,res) => {
    let data = {};
    res.render("registration", { data: data, layout: false });
});

app.post('/registration', (req, res) =>{

    check('name', 'Name is required.')
        .exists()
        .withMessage("username is required."),

    check('password')
        .exists()
        .withMessage("Password is required.")
        .isIn(number).isIn(letter)
        .isLength({ min: 6, max: 12 })
        .withMessage("The password must consist of at least 8 characters, numbers, and special characters."),

    check('email', "Email is required.")
        .exists()
        .normalizeEmail(),

    check('phonenum')
        .exists()
        .withMessage("Phone number is required.")
        .isIn("/-/")
        .withMessage("The phone number must consist of numbers only."),

    check('strAddress', "Street Address is required.")
        .exists(),

    check('city', "city is required.")
        .exists(),

    check('state', "state is required.")
        .exists(),

    check('zip', "zip code is required.")
        .exists()

    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    let phonenum = req.body.phonenum;

    let company = req.body.company;
    let street = req.body.street;

    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let zip = req.body.zip;

    let data = {
        values: {
            name: name,
            password: password,
            email: email,
            phonenum: phonenum,
            company: company,
            street: street,
            address: address,
            city: city,
            state: state,
            zip: zip
        },
        errors: {
            error: ""
        }
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alert = errors.array();
        res.render('registration', { alert: alert, data: data, layout: false });
    } else {
        (req, res) =>userAccount.create({
            name: name,
            password: password,
            email: email,
            phonenum: phonenum,
            company: company,
            street: street,
            address: address,
            city: city,
            state: state,
            zip: zip
        }).then((obj) => {
            res.render("dashboard", { data: data, layout: false });
        })
    }
});

app.get("/dashboard", (req, res) => {
    let _customerID = req.data.values.customerID;

    userAccount.findAll({
        attributes: ["name", "email", "position"],
        where: {
            customerID: _customerID
        },
        order: ["name"]
    }).then((obj) => {
        let data = obj.map(value => value.dataValues);

        if (obj.position = "admin") {
            res.render("adminDashboard", { data: data, layout: false });
        } else res.render("dashboard", { data: data, layout: false });

    });
});

////// Plan /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Select and Show All
app.get('/plans', (req, res) => {
    package.findAll({
        attributes: ['planName', 'planPrice', 'planDetail', 'featureList']
    }).then((objs) => {
        let data = obj.map(value => value.dataValues);
        res.render("plans", { objs: objs, data: data, layout: false });
    });
});

// Create or Insert
// app.post("/createPlan", uploader.single('uploadImage'), urlencodedParser, [
//     check('planName', 'Plan name is required.')
//         .exists(),

//     check('planPrice', 'Price is required.')
//         .exists()
//         .matches('\w'),

// ], createPlan(req, res))

// app.post("/editPlan", uploader.single('uploadImage')
// , updatePlan(req, res))

function createPlan(req, res) {
    let name = req.body.planName;
    let price = req.body.planPrice;
    let desc = req.body.planDesc;
    let list = JSON.parse(req.body.features);  // string -> object
    let image = req.file.filename;

    let data = {
        values: {
            planName: name,
            planPrice: price,
            planDetail: desc,
            features: list,
            image: image
        }
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alert = errors.array();
        res.render('createPlan', {
            alert: alert, data: data, layout: false
        })
    } else {
        package.create({
            planName: name,
            planPrice: price,
            planDetail: desc,
            features: list,
            image: image
        }).then((obj) => {
            res.render("plans", { data: data, layout: false });
        })

    }
}
function updatePlan(req, res) {
    package.findAll({
        attributes: ["planName", "planPrice", "planDesc", "features", "filename"],
        where: {
            planName: req.body.planName
        },
        order: ["planName"]
    }).then((obj) => {
        let _data = obj.map(value => value.dataValues);

        package.update({
            // data = _data
        }, {
            where: {
                planName: req.body.planName
            }
        }).then(() => {
            res.render("plans", { data: data, layout: false });
        });
    });
    
}

app.use((req, res) => {
    res.status(404).render("page_not_found");
})