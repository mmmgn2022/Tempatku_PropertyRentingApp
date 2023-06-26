const { join } = require("path");
require('dotenv').config({ path: join(__dirname, '../.env') });
const express = require("express");
const cors = require("cors");
const bearerToken = require("express-bearer-token");
const cookieSession = require("cookie-session");
const passport = require("passport");
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 2341;
const app = express();
app.use(express.json());
app.use(cors());
app.use(bearerToken());
app.use("/", express.static(__dirname + "/public"));
app.use(cookieParser())

// required middlewares google auth
app.use(
    cookieSession({
        name: process.env.SESSION_NAME,
        keys: [process.env.SESSION_KEYS],
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "None",
        secure: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

//#region API ROUTES

// ===========================
// NOTE : Add your routes here
const transactionRouter = require('./routers/transactionRouter');
const categoryRouter = require('./routers/categoryRouter');
const userRouter = require('./routers/userRouter');
const propertyRouter = require('./routers/propertyRouter');
const orderRouter = require('./routers/orderRouter');
const roomRouter = require('./routers/roomRouter');
const calendarRouter = require("./routers/calendarRouter");
const reviewRouter = require("./routers/reviewRouter");
const specialRouter = require("./routers/specialRouter");
const maintenanceRouter = require("./routers/maintenanceRouter");
const reportRouter = require("./routers/reportRouter");
const landingRouter = require("./routers/landingRouter");
const passportRouter = require("./routers/passportRouter");
const { reminderCheckInUser } = require("./helper/schedule");

app.use('/api/user', userRouter);
app.use('/api/transaction', transactionRouter)
app.use('/api/category', categoryRouter)
app.use('/api/order', orderRouter)
app.use('/api/room', roomRouter)
app.use("/api/calendar", calendarRouter);
app.use("/api/review", reviewRouter);
app.use("/api/property", propertyRouter);
app.use("/api/special", specialRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/report", reportRouter);
app.use("/api/landing", landingRouter);
app.use('/api/auth', passportRouter);
// ==============================================
// NOTE : Add your routes here
app.get("/api", (req, res) => {
    res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
    res.status(200).json({
        message: "Hello, Student !",
    });
});




// ===========================

// not found
app.use((req, res, next) => {
    if (req.path.includes("/api/")) {
        res.status(404).send("Not found !");
    } else {
        next();
    }
});

// SEND EMAIL REMINDER H-1
reminderCheckInUser()


// error
app.use((err, req, res, next) => {
    if (req.path.includes("/api/")) {
        console.error("Error : ", err);
        res.status(500).send(err);
    } else {
        next();
    }
});

//#region CLIENT
const clientPath = "../../client/build";
app.use(express.static(join(__dirname, clientPath)));

// Serve the HTML page
app.get("*", (req, res) => {
    res.sendFile(join(__dirname, clientPath, "index.html"));
});

//#endregion

app.listen(PORT, (err) => {
    if (err) {
        console.log(`ERROR: ${err}`);
    } else {
        console.log(`APP RUNNING at ${PORT} ✅`);
    }
});
