const mongoose=require('mongoose');
const express=require('express');
const router=express.Router();
const Fawn=require('fawn');
const {Rental,validate}=require('../models/rentalmodel');
const {Movie}=require('../models/moviemodel');
const {Customer}=require('../models/customermodel');

Fawn.init(mongoose);

router.get('/',async(req,res)=>{
    const result=await Rental.find().sort('-dateOut');
    res.send(result);
});

router.post('/',async(req,res)=>{
    const {error} =validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer=await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid customer');

    const movie=await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid movie');

    if(movie.numberInStock==0) return res.status(400).send('Movie out of stock');

    let rental=new Rental({
        customer:{
            _id:customer._id,
            name:customer.name,
            isGold:customer.isGold,
            phone:customer.phone
        },
        movie:{
            _id:movie._id,
            title:movie.title,
            dailyRentalRate:movie.dailyRentalRate
        }
    });
    // rental=await rental.save();

    //movie.numberInStock--;
    //movie.save();
    try{
        new Fawn.Task()
          .save('rentals',rental)
          .update('movies',{_id:movie._id},{
              $inc:{numberInStock:1}
            })
          .run();
       res.send(rental);
    }
    catch(ex){
        res.status(500).send('Somehting failed');
    }
});

router.put('/:id',async(req,res)=>{
    const {error} =validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer=await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid customer');

    const movie=await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid movie');

    if(movie.numberInStock==0) return res.status(400).send('Movie out of stock');

    let rental= await Rental.findByIdAndUpdate(req.params.id,{
        customer:{
            _id:customer._id,
            name:customer.name,
            isGold:customer.isGold,
            phone:customer.phone
        },
        movie:{
            _id:movie._id,
            title:movie.title,
            dailyRentalRate:movie.dailyRentalRate
        }
    },{new:true});
    
    if(!rental) return res.status(404).send('The rental with the given ID was not found.');

    res.send(rental);
});
router.get('/:id', async (req, res) => {
    const rental = await Rental.findById(req.params.id);
  
    if (!rental) return res.status(404).send('The rental with the given ID was not found.');
  
    res.send(rental);
  });
  
  module.exports = router;

