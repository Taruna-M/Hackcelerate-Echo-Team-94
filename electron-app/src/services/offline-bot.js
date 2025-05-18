
const axios = require('axios');

async function askModelOffline(prompt, model = 'codegemma:7b') {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: model,
      prompt: prompt,
      stream: false
    });

    return response.data.response || '🤖 No response from the local model.';
  } catch (error) {
    return `⚠️ Offline Bot Error: ${error.response?.status || ''} ${error.message}`;
  }
}

module.exports = askModelOffline;
