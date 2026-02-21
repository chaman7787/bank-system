const express = require('express');
const mongoose = require('mongoose');
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const cookieparser = require("cookie-parser");
const TransactionRouter = require("./routes/transaction.route.js");
require('dotenv').config();

const app = express();
const port = 3000;      

app.use(express.json())
app.use(cookieparser())

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transactions",TransactionRouter);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');        

app.listen(port, () => {
    console.log(`server starts at http://localhost:${port}`);    
});
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);        
 });
