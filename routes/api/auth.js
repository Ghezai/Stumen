const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path:'./config/config.env'});


//User
//@route GET api/auth
//@desc Gets the authenticated user data
//@access Private, we need token to access

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//Login
//@route  POST api/auth
//@desc   Authentication user & respond token
//@access Public (asking to login)

router.post(
      '/',
      [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
          // See if user exists
          let user = await User.findOne({ email });
          if (!user) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'Invalid Credentials' }] });
          }
          //compare password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'Invalid Credentials' }] });
          }
          
          const payload = {
            user: {
              id: user.id
            }
          };

        // Return jsonwebtoken
          jwt.sign(
            payload,
            process.env.JWTSECRET,
            { expiresIn: 360000 }, //360000 seconds = 100hr in develop app use short like 3600 sec = 1hr
            (err, token) => {
              if (err) throw err;
              res.json({ token });
            }
          ); 
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      }
    );
    

module.exports = router;