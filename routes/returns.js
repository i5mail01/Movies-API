const Joi=require('joi');
const moment=require('moment');
const {Rental} = require('../models/rentalmodel');
const {Movie} = require('../models/moviemodel');
const auth=require('../middleware/auth');
const express = require('express');
const router = express.Router();
const validate=require('../middleware/validate');

router.post('/', [auth, validate(validateReturn)] , async (req, res) => {
    const rental=await Rental.lookup(req.body.customerId, req.body.movieId);

    if(!rental) return res.status(404).send('Rental Not Found');

    if(rental.dateReturned) return res.status(400).send('Return already processed');

    rental.return();
    
    await rental.save();

    await Movie.update(
        {
            _id:rental.movie._id
        },
        {
            $inc:{
                numberInStock:1
            }         
        });
    
    return res.status(200).send(rental);
});

function validateReturn(req) {
    const schema = {
      customerId : Joi.objectId().required(),
      movieId : Joi.objectId().required()
    };
  
    return Joi.validate(req, schema);
}

module.exports=router;