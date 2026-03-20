const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email :{
        type : String,
        unique : true,
        sparse : true,
    },
    fullname: {
        firstname :{
            type : String,
            required : true
        },
        lastname:{
            type : String,
            required : true
        }
    },
    username :{
        type : String,
        unique: true,
    },
    password:{
        type : String
    },
    googleId: {
      type: String,
      sparse: true, // allows multiple null values without unique conflict
      unique: true,
    },

    avatar: {
      type: String, // stores Google profile picture URL
      default: null,
    }
},{timestamps : true});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;