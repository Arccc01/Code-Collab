const sessionModel = require('../models/session.model')
const generateReview = require('../services/ai.services')

async function reviewController(req, res){
  try {
    const { sessionId, code, language } = req.body

    // 1. Validate required fields
    if (!sessionId || !code || !language) {
      return res.status(400).json({
        message: 'sessionId, code and language are required'
      })
    }

    // 2. Check if session exists
    const session = await sessionModel.findOne({ sessionId })

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    // 3. Check if the user is a participant of this session
    const isParticipant = session.participants.some(
      (participantId) => participantId.toString() === req.user._id.toString()
    )

    if (!isParticipant) {
      return res.status(403).json({
        message: 'You are not a participant of this session'
      })
    }

    // 4. Build the prompt
    const prompt = `
      You are an expert code reviewer.
      Review the following ${language} code carefully.
      
      Provide your response in exactly three sections:

      1. **Issues Found**
      List any bugs, errors, or bad practices. If none, write "No issues found."

      2. **Suggestions**
      List improvements for readability, performance, or best practices.

      3. **Overall Summary**
      A brief 2-3 sentence summary of the code quality.

      Here is the code to review:
      \`\`\`${language}
      ${code}
      \`\`\`
    `

    // 5. Call Gemini API
    const review = await generateReview(prompt)

    // 6. Return the review
    return res.status(200).json({
      review,
      language,
    })

  } catch (err) {
    console.error('AI review error:', err)
    return res.status(500).json({ message: 'Failed to generate review' })
  }
}


module.exports = reviewController