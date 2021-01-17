const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

//@route  POST api/posts
//@desc   Create a post
//@access Private we need tokens

router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password'); 
      //we dont want password to include here thats why we use ("-password") in the above code.

      const newPost = new Post({
        text: req.body.text, //the Post itself.
        name: user.name, // we attach the user name, avatar image, and user.id to the Post.
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post); //we response with post data
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

 //@route  GET api/posts
 //@desc   Get all posts
 //@access Private we need tokens (thats why people singup to read the posts)

       router.get('/', auth, async (req, res) => {
          try {
            const posts = await Post.find().sort({ date: -1 });
            // we will sort this by the most recent post / by new post
            res.json(posts);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
          }
        });
        
        //@route  GET api/posts/:id
        //@desc   Get posts by postsID
        //@access Private we need tokens
        
        router.get('/:id', auth, async (req, res) => {
          try {
            const post = await Post.findById(req.params.id);

            if (!post) {
              return res.status(404).json({ msg: 'Post not found' });
            }
            res.json(post);
          } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
              //if the objectId is wrong we want also to return "Post not found"
              return res.status(404).json({ msg: 'Post not found' });
            }
            res.status(500).send('Server Error');
          }
        });
        
        //@route  DELET api/posts/:id
        //@desc   Delete a post
        //@access Private we need tokens
        
        router.delete('/:id', auth, async (req, res) => {
          try {
            const post = await Post.findById(req.params.id);
            if (!post) {
              return res.status(404).json({ msg: 'Post not found' });
            }
            //check user
            if (post.user.toString() !== req.user.id) {
              return res.status(401).json({ msg: 'User not authorized' });
            }

            await post.remove();

            res.json({ msg: 'Post removed' });
          } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
              //if the objectId is wrong we want also to return "Post not found"
              return res.status(404).json({ msg: 'Post not found' });
            }
            res.status(500).send('Server Error');
          }
        });

       //@route  PUT api/posts/like/:id
       //@desc   Like a post
       //@access Private we need tokens

    router.put('/like/:id', auth, async (req, res) => {
      try {
        const post = await Post.findById(req.params.id);

        //check if the post has already been liked
        if (
          post.likes.filter(like => like.user.toString() === req.user.id).length > 0
        ) {
          return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    });
    
    
    //@route  PUT api/posts/like/:id
    //@desc   Like a post
    //@access Private we need tokens
    
    router.put('/unlike/:id', auth, async (req, res) => {
      try {

        const post = await Post.findById(req.params.id);

        //check if the post has not yet been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) 
        {
          return res.status(400).json({ msg: 'Post has not yet been liked' });
        }

        // remove the like
        post.likes = post.likes.filter( ({ user }) => user.toString() !== req.user.id);

        await post.save();

        res.json(post.likes);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    });

    //@route  POST api/posts/comment/:id
    //@desc   Add Comment on a post
    //@access Private we need tokens
    router.post(
        '/comment/:id',
        [
          auth,
          [check('text', 'Text is required').not().isEmpty()]
        ],
        async (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
      
          try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);
      
            const newComment = {
              text: req.body.text,
              name: user.name,
              avatar: user.avatar,
              user: req.user.id
            };
      
            post.comments.unshift(newComment);
      
            await post.save();
      
            res.json(post.comments);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
          }
        }
      );
      
    //@route  DELETE api/posts/comment/:id/:comment_id
    //@desc   Delete comment
    //@access Private we need tokens

    router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
      try {
        //:id is the postID and comment_id is the CommentID
        const post = await Post.findById(req.params.id);

        //pull out comment because we can have multiple comments
        const comment = post.comments.find(
          comment => comment.id === req.params.comment_id
        );
        if (!comment) {
          return res.status(404).json({ msg: 'Comment does not exist' });
        }
        if (comment.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'User not authorized' });
        }
        const removeIndex = post.comments
          .map(comment => comment.user.toString())
          .indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
    
module.exports = router;