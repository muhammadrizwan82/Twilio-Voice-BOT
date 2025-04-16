exports.handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    const speech = event.SpeechResult;
    const OPENAI_API_KEY = context.OPENAI_API_KEY;
  
    if (!speech) {
      twiml.gather({
        input: 'speech',
        action: '/voice',
        method: 'POST',
        bargeIn: true,
        speechTimeout: 'auto'
      }).say("Hi! You're speaking with our AI assistant. How can I help you today?");
      return callback(null, twiml);
    }
  
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: speech }]
        })
      });
  
      const data = await openaiResponse.json();
  
      if (!data.choices || !data.choices.length) {
        throw new Error("No choices returned from OpenAI.");
      }
  
      const reply = data.choices[0].message.content;
  
      twiml.gather({
        input: 'speech',
        action: '/voice',
        method: 'POST',
        bargeIn: true,
        speechTimeout: 'auto'
      }).say(reply);
  
      return callback(null, twiml);
  
    } catch (error) {
      console.error("❌ OpenAI Error:", error);
      twiml.say("Sorry, something went wrong. Please try again.");
      return callback(null, twiml);
    }
  };
  