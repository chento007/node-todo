const express = require('express');
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
var cors = require('cors')
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize")
const hpp = require("hpp")

const devenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express()
const errorMiddleware = require("./api/middlewares/errors")
const connectDatabase = require("./api/config/database")
const ErrorHandler = require("./api/exceptions/ErrorHandler")
devenv.config({ path: ".env" })

// handle uncaught exception
process.on("uncaughtException", err => {
    console.log("ERROR: ", err.message)
    process.exit(1);
})
app.use(cors())


connectDatabase();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

app.use(express.json())

app.use(cookieParser());

app.use(fileUpload());

app.use(mongoSanitize())

app.use(hpp({
    whitelist : ["positions"]
}))

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100,

});

app.use(limiter)

const jobs = require("./api/routes/job.routes")
const auth = require("./api/routes/auth.routes")
const users = require("./api/routes/user.routes")
const todo = require("./api/routes/todo.routes")

app.use("/api/v1/auth", auth)
app.use("/api/v1/jobs", jobs)
app.use("/api/v1/users", users)
app.use("/api/v1/todo", todo)

app.all("*", (req, res, next) => {
    next(new ErrorHandler(req.originalUrl + " route not found.", 404))
})

app.use(errorMiddleware)

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log('Server run on port ' + PORT + " in " + process.env.NODE_ENV + " mode")
});

// handle unhandle error
process.on("unhandledRejection", err => {

    console.log("error : ", err.message);
    console.log("Shutting down the server dur to handled promiss rejection");

    server.close(() => {
        process.exit(1);
    })
})