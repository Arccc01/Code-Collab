const mongoose = require('mongoose')


const messageSchema = new mongoose.Schema({
    sessionId :{
        type:String,
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String,
        required:true
    },
    type: {
      type: String,
      enum: ['text'],
      default: 'text',
    },

},{timestamps: true,})


const messageModel = mongoose.model('message',messageSchema)
module.exports = messageModel