const express = require('express');
const app = express();
require('dotenv/config'); // importing library to read variables from the .env file
const bodyParser = require('body-parser'); // library used to parse json data so that it can be easiy fetchable
const morgan = require('morgan'); // library used to get logs info. Means whether the post or get happens. How many seconds it takes etc. All logs info in terminal. We can even save it in our files.
const mongoose = require('mongoose'); // library for connecting with mongoDB in cloud
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');


// This is used for allowing the application to send every kind of HTTP request like create, read, delete etc... Its very important line to add
app.use(cors());
app.options('*', cors());

// middleware APIs
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
// handling error
app.use(errorHandler);

const api = process.env.API_URL;
const categoryRouter = require('./routers/categories')
const productRouter = require('./routers/products')
const userRouter = require('./routers/users')
const orderRouter = require('./routers/orders')



// Routes
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/products`, productRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);



// connecting with mongoDB database
mongoose.connect(process.env.CONNECTION_STRING, {
    // this is just to remove depracted warnings on the terminal.
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(() => {
    console.log("Database connection is ready");
})
.catch((err) => {
    console.log(err);
});

// Development
// app.listen(3000, () => {
//     console.log(api); 
//     console.log("Server is running http://localhost:3000");
// })

// Production
var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("Express is working on port " + port)
})