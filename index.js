const path = require("path");
const express = require("express");
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require("cors");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const AppError = require('./utills/appError');
const GlobalError = require('./utills/errorController')
const authRoute = require("./user/routes/authentication")
const customerRoute = require("./user/routes/routes.customer")
const companyRoute = require("./companies/routes/routes.Companies")
const pricingRoute =  require("./pricing_table/routes/routes.pricing")
const quotationRoute = require("./quotations/routes/routes.Quotations")



// call GLOBAL MIDDLEWARES
const app = express();
app.enable('trust proxy');

// app.use(cors());

app.options('*', cors());

app.use(express.json({limit: '50mb'}));


// Serving static files (pdf)
app.use(helmet());


// Development logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('dev'));
}


// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());


app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});


app.get('/', (req, res) => res.json('Hellooooo'))
app.use("/auth", authRoute);
app.use("/customer", customerRoute)
app.use('/companies', companyRoute)
app.use("/pricing", pricingRoute)
app.use("/quotation", quotationRoute)


app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(GlobalError);

module.exports = app;