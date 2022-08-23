const {User}=require('../../models/usermodel');
const request=require('supertest');
const {Rental} = require('../../models/rentalmodel');
const mongoose=require('mongoose');
const moment=require('moment');
const {Movie} = require('../../models/moviemodel');

describe('/api/returns',()=>{
    let server;
    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    const exec=()=>{
        return request(server)
                .post('/api/returns')
                .set('x-auth-token',token)
                .send({ 
                    customerId:customerId,
                    movieId:movieId 
                });
    };

    beforeEach(async()=>{
        server=require('../../index');
        
        customerId=mongoose.Types.ObjectId();
        movieId=mongoose.Types.ObjectId();
        token=new User().generateAuthToken();

        movie=new Movie({
            _id:movieId,
            title:'12345',
            dailyRentalRate:2,
            genre:{
                name:'12345',
            },
            numberInStock:10
        });
        await movie.save();

        rental=new Rental({
            customer:{
                _id:customerId,
                name:'12345',
                phone:'12345'
            },
            movie:{
                _id:movieId,
                title:'12345',
                dailyRentalRate:2
            }
        });
        await rental.save();
    });

    afterEach(async()=>{
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    it('should return 401 if client is not logged in ',async()=>{
        token='';

        const res=await exec();
        
        expect(res.status).toBe(401);
    });

    it('should return 400 if customer ID is not provided', async()=>{
        customerId='';
        //delete payload.customerId; another way to remove customerId 

        const res=await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if movie ID is not provided', async()=>{
        movieId='';
        //delete payload.movieId; another way to remove movieId 

        const res=await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for customer/movie', async()=>{
        await Rental.remove({});

        const res=await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if return is already processed', async()=>{
        rental.dateReturned=new Date();
        await rental.save();
        
        const res=await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if we have a valid request', async()=>{
        const res=await exec();

        expect(res.status).toBe(200);
    });

    it('should set return date if input is valid', async()=>{
        const res=await exec();

        const rentalInDb=await Rental.findById(rental._id);
        const diff=new Date()-rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10*1000);
    });

    it('should set rentalFee if input is valid', async()=>{
        rental.dateOut= moment().add(-7,'days').toDate(); //7days ago
        await rental.save();

        await exec();

        const rentalInDb=await Rental.findById(rental._id);
        expect(rentalInDb.rentalFees).toBe(14);
    });

    it('should increase the movie stock', async()=>{
        const res=await exec();

        const movieInDb=await Movie.findById(movieId);
        expect(movieInDb.numberInStock).toBe(11);
    });

    it('should return the rental if input is valid', async()=>{
        const res=await exec();

        const rentalInDb=await Rental.findById(rental._id);
        //expect(res.body).toHaveProperty('dateOut');
        //expect(res.body).toHaveProperty('dateReturned');
        //expect(res.body).toHaveProperty('rentalFees');
        //expect(res.body).toHaveProperty('customer');
        //expect(res.body).toHaveProperty('movie');

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut','dateReturned','rentalFees','customer','movie']));
    });
});