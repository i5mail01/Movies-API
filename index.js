//mongoose@5.0.2
//Joi@13.1.0
//express@4.16.2
//fawn@2.1.5 for 2-phase commit
//lodash@4.17.4 for authentication and authorization section
//bcrypt@1.0.3 for hashing the passwords
//jsonwebtoken@8.1.1 
//config@1.29.4
//express-async-errors@2.1.0
//winston@2.4.0
//winston-mongodb@3.0.0
//jest@22.2.2 --save-dev
//supertest@3.0.0 --save-dev
//moment@2.20.1
/**
 * before staring this application:
 * set vidly_jwtPrivateKey=mySecureKey
 */
/**
 * for deployment phase
 * helemt@3.11.0
 * compression@1.7.2
 */

const winston=require('winston');
const express=require('express');
const app=express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);


const port=process.env.PORT||3000;
const server=app.listen(port,() => winston.info(`Listening on port ${port}....`));

module.exports=server;