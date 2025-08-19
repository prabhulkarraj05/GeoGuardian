const User = require('../models/User');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

exports.triggerSOS = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const guardianPhone = user.guardian.phone;
    // Send SOS call
    await client.calls.create({
      twiml: '<Response><Say>This is an emergency alert from GeoGuardian. Please check your dependent!</Say></Response>',
      to: guardianPhone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    res.json({ message: 'SOS call placed to guardian' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to make SOS call' });
  }
};
