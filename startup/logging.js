const winston=require('winston');
//require('winston-mongodb');
require('express-async-errors');

module.exports=function(){
    //process.on('uncaughtException',(ex)=>{
    //  winston.error(ex.message,ex);
    //  process.exit(1);
    //});
    winston.handleExceptions(
        new winston.transports.Console({colorize:true,prettyPrint:true}),
        new winston.transports.File({filename:'uncaughtExceptions.log'}));
      
      process.on('unhandledRejection',(ex)=>{
      //  winston.error(ex.message,ex);
      //  process.exit(1);
          throw ex;
      });
      
      winston.add(winston.transports.File,{filename:'logfile.log'});
/*    winston.add(winston.transports.MongoDB,{
        db:'mongodb://localhost/vidly'
        //,level:error     **only  error gets displayed and the levels can be set
        //,level:info   **only error,warning and info messages will be logged and nothing after that
      });*/
}
