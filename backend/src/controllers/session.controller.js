const { v4: uuidv4 } = require("uuid");
const sessionModel = require('../models/session.model')
const messageModel = require('../models/message.model')


async function createSessionController(req,res){
   try{ 
    const user = req.user;
    const newSession = new sessionModel({
        sessionId : uuidv4(),
        owner : user._id,
        participants : [user._id]
    })
    await newSession.save()

    res.status(201).json({
        message: "new session has been created",
        session : newSession
    })}catch(err){
        console.log("error is ",err)
    }
}

async function singleSessionController(req, res) {
  try {
    
    const session = await sessionModel.findOne({ sessionId: req.params.sessionId })
      .populate('owner', 'username email')
      .populate('participants', 'username email');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (!session.isActive) {
      return res.status(403).json({ message: 'This session has ended' });
    }

    return res.status(200).json({ session });

  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function mysessionController(req, res){
  try {
    const sessions = await sessionModel.find({ owner: req.user.id })
      .populate('participants', 'username email')
      .sort({ createdAt: -1 })
      .select('-code');

    return res.status(200).json({
      count: sessions.length,
      sessions,
    });

  } catch (error) {
    console.error('Get my sessions error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function sessionMessageController(req,res){
    const session = await sessionModel.findOne({sessionId:req.params.sessionId})
    if(!session){
        res.status(404).json({message:"Session not found"})
    }
    const isParticipant = session.participants.some(
      (participantId) => participantId.toString() === req.user._id.toString()
    )

    if(!isParticipant){
        res.status(403).json({message:"User does not belong to this session"})
    }
    // Pagination — read from query params with defaults
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

     // Fetch messages
    const messages = await messageModel
      .find({ sessionId: req.params.sessionId })
      .populate('sender', 'username email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)

    //  Get total count
    const totalMessages = await messageModel.countDocuments({
      sessionId: req.params.sessionId
    })

    //Return response
    const totalPages = Math.ceil(totalMessages / limit)

    return res.status(200).json({
      messages,
      totalMessages,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
    })

}


module.exports = {
    createSessionController,singleSessionController,mysessionController,sessionMessageController
}