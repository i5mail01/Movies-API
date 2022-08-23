const validateObjectId=require('../middleware/validateObjectId');
const asyncMiddleware=require('../middleware/async');
const auth=require('../middleware/auth');
const admin=require('../middleware/admin');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const mongoose=require('mongoose');
const {genreSchema,Genre,validate}=require('../models/genremodel');



router.get('/', async (req, res) => {
  //throw new Error('Couldnt get the genres');
  const genres=await Genre
        .find()
        .sort({name:1});  
  res.send(genres);
  });
  
router.post('/',auth,async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let genre = new Genre({
       name: req.body.name
    });
    genre=await genre.save();
    
    res.send(genre);
  });
  
router.put('/:id', async(req, res) => {
    const { error } = validate(req.body); 
    if (error) 
        return res.status(400).send(error.details[0].message);

    const genre=await Genre.findByIdAndUpdate(req.params.id,
        {
            name:req.body.name
        },
        {
            new:true
        });
    
    if (!genre) 
         return res.status(404).send('The genre with the given ID was not found.');
    res.send(genre);
  });
  
router.delete('/:id',[auth,admin], async (req, res) => {
    const genre=await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
  });
  
router.get('/:id',validateObjectId,async (req, res) => {
  
  const genre= await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

module.exports = router;