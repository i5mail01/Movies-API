const express=require('express');
const error=require('../middleware/error');
const rentals=require('../routes/rentals');
const auth=require('../routes/auth');
const users=require('../routes/users');
const genres=require('../routes/genres');
const movies=require('../routes/movies');
const customers=require('../routes/customers');
const returns=require('../routes/returns');

module.exports=function(app){
    app.use(express.json());
    app.use('/api/rentals',rentals);
    app.use('/api/genres',genres);
    app.use('/api/users',users);
    app.use('/api/auth',auth);
    app.use('/api/movies',movies);
    app.use('/api/customers',customers);
    app.use('/api/returns',returns);
    app.use(error);
}