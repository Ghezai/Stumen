const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { check, validationResult} = require('express-validator');


const User = require('../../models/User');
dotenv.config({ path:'./config/config.env'});

//this file will be
//@route GET api/users
//@desc Test route
//@access Public we don't use token her

router.get('/', (req, res) => res.send('User route'));

//this file will be
//@route POST api/users
//@desc Register user
//@access Public we don't need token her

router.post(
    '/',
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail().not().isEmpty(),
      check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if we have same user in database
        try {
            let user = await User.findOne({ email });
            if(user){
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

        // Get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });
       
        // Getting data from req.body and put them as object
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password using Bcrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();

        // Return jsonwebtoken
        const payload = { 
            user: {
                id: user.id
        }}; 
        

        jwt.sign(
            payload,
            process.env.JWTSECRET,
            { expiresIn: 360000 }, //this token after 360000 second will expire
            (err, token ) => {
                if (err) throw err;
                res.json({ token });
            }
        );


        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
            }

        
});

module.exports = router;