const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Post model
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users' //this post connected to the user, the user can delete or edit
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  avatar: {
    //if the user want to delete its account but if the post don't want delete, we can show the user avatar of the user
    type: String
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId, //a User like in this post 
        ref: 'users'
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId, // a User comments in this post
        ref: 'users'
      },
      text: {
        type: String
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);
