const AfricasTalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});
module.exports = AfricasTalking.SMS;

// allow folder per user; lock down allowed params you expect on client 
