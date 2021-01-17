const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const dotenv = require('dotenv');
const Post = require('../../models/Post');

const { check, validationResult } = require('express-validator');

dotenv.config({ path:'./config/config.env'});

//this file will be
//@route GET api/profile
//@desc Test route
//@access Private need token her

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        );
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route  Post api/profile/me
//@desc   Create or Update users profile
//@access Private (using auth, middleware)

router.post(
      '/',
      [
        auth, //authorization
        [
          check('status', 'Status is required') //validation
            .not()
            .isEmpty(),
          check('skills', 'Skills is required')
            .not()
            .isEmpty()
        ]
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        //getting data from request body
        const {
          company,
          website,
          location,
          bio,
          status,
          githubusername,
          skills,
          youtube,
          facebook,
          twitter,
          instagram,
          linkedin
        } = req.body;
    
        const profileFields = {}; //new profile empty object
    
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
          profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        profileFields.social = {};

        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;
        try {
          let profile = await Profile.findOne({ user: req.user.id });
          if (profile) {
            // if the profile is available, we will only update it
            profile = await Profile.findOneAndUpdate(
              { user: req.user.id },
              { $set: profileFields },
              { new: true }
            );
            return res.json(profile);
          }
          // Create profile (if the profile is not available, this will create new profile)
          profile = new Profile(profileFields);
          await profile.save();
          res.json(profile);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      }
    );

    //@route GET api/profile
    //@desc Access profile of users
    //@access Public 

    router.get('/', async (req, res) => {
        try {
            const profiles = await Profile.find().populate('user', ['name', 'avatar']);
            res.json(profiles);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server');
        }
    });

    //@route GET api/profile/user/:user_id
    //@desc Access profile of users by user Id
    //@access Public

    router.get('/user/:user_id', async (req, res) => {
        try{
            const profile = await Profile.findOne({
                user: req.params.user_id }).populate('user', ['name', 'avatar']);
                if (!profile)
                   return res.status(400).json({ msg: 'Profile not found' });
                res.json(profile);

        }catch(err){
            console.error(err.message);
            if (err.kind == 'ObjectId'){
                return res.status(400).json({ msg: 'Profile not found' });
            }
            res.status(500).send('Server Error');
        }   
    });

    //@route DELETE api/profile
    //@desc Delete profile, user, profile and posts
    //@access Private

    router.delete('/', auth, async (req, res) => {
        try {
            // Remove one user all posts, when user delete his/her account
            await Post.deleteMany({ user: req.user.id});
            // Remove profile
            await Profile.findOneAndRemove({ user: req.user.id });
            // Remove User
            await User.findOneAndRemove({ _id: req.user.id});
            res.json({ msg: 'User Deleted' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    //@desc Add profile experience
    //@route PUT api/profile/experience
    //@access Private

    router.put(
      '/experience',
      [
        //here using middleware for check user validation
        auth,
        [
          check('title', 'Title is required')
            .not()
            .isEmpty(),
          check('company', 'Company is required')
            .not()
            .isEmpty(),
          check('from', 'From date is required')
            .not()
            .isEmpty()
        ]
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        //bring data from the body of request
        const {
          title,
          company,
          location,
          from,
          to,
          current,
          description
        } = req.body;
        //create new object and hold the above data in the object
        const newExp = {
          title,
          company,
          location,
          from,
          to,
          current,
          description
        };
        try {
          const profile = await Profile.findOne({ user: req.user.id });
          //unshift is the same as push, here we need to push this new object "newExp"
          profile.experience.unshift(newExp);
          await profile.save();
          res.json(profile);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      }
    );

    // @route DELETE api/profile/experience/:exp_id
    // @desc Delete experience from profile
    // @access Private

    router.delete('/experience/:exp_id', auth, async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
            profile.experience.splice(removeIndex, 1);

            await profile.save();
            
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

    //@desc   Add profile education
    //@route  PUT api/profile/education
    //@access Private
    router.put(
      '/education',
      [
        //here using middleware for check validation
        auth,
        [
          check('school', 'School is required')
            .not()
            .isEmpty(),
          check('degree', 'Degree is required')
            .not()
            .isEmpty(),
          check('fieldofstudy', 'Field of study is required')
            .not()
            .isEmpty(),
          check('from', 'From date is required')
            .not()
            .isEmpty()
        ]
      ],
      async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        //bring data from the body of the request
        const {
          school,
          degree,
          fieldofstudy,
          from,
          to,
          current,
          description
        } = req.body;
        //create new object and hold the above data in the object
        const newEdu = {
          school,
          degree,
          fieldofstudy,
          from,
          to,
          current,
          description
        };
        try {
          const profile = await Profile.findOne({ user: req.user.id });
          //unshift is the same as push, here we need to push this new object "newExp"
          profile.education.unshift(newEdu);
          await profile.save();
          res.json(profile);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      }
    );
    
    // @route DELETE api/profile/education/:edu_id
    // @desc Delete education from profile
    // @access Private
    router.delete('/education/:edu_id', auth, async (req, res) => {
      try {
        const profile = await Profile.findOne({ user: req.user.id });
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    });

    // @route GET api/profile/github/:username
    // @desc Get user repos from Github
    // @access Public

    router.get('/github/:username', (req, res) => {
        try {
            const options = {
                uri: `https://api.github.com/users/${
                    req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.ClientID}
                    &client_secret=${process.env.ClientSecret}`,
                    method: 'GET',
                    headers: {
                        'user-agent': 'node.js'
                    }
                };
            request(options, (error, response, body) => {
                if (error) console.error(error);
                if(response.statusCode !== 200) {
                    return res.status(404).json({ msg: 'No Github profile found'});
                }
                res.json(JSON.parse(body));
            });  
        } catch (err) {}
    });
    

module.exports = router;