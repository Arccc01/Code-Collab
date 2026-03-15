const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    code: {
      type: String,
      default: '',
    },

    language: {
      type: String,
      default: 'javascript',
      enum: [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'c',
        'go',
        'rust',
        'html',
        'css',
      ],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const sessionModel = mongoose.model("Session",sessionSchema)

module.exports = sessionModel;