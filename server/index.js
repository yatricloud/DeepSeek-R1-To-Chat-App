import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3000;

const OLLAMA_URL = 'http://localhost:11434';

app.use(cors({
  origin: ['http://localhost:5173', 'https://chat.yatricloud.com', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/health', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/version`);
    res.json({ 
      status: 'ok', 
      message: 'Connected to Ollama',
      version: response.data
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      message: 'Cannot connect to Ollama',
      details: error.message
    });
  }
});

function cleanResponse(text) {
  // Only remove <think> tags and their content, preserve other spacing
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<\/?think>/g, '');
}

app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'deepseek-r1:1.5b',
      prompt: message,
      stream: true
    }, {
      responseType: 'stream'
    });

    let buffer = '';
    
    response.data.on('data', chunk => {
      try {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          const json = JSON.parse(line);
          if (json.response) {
            buffer += json.response;
            
            // Only clean think tags, preserve original spacing
            const cleanedChunk = cleanResponse(buffer);
            if (cleanedChunk) {
              res.write(`data: ${JSON.stringify({ chunk: cleanedChunk })}\n\n`);
              buffer = ''; // Reset buffer after sending
            }
          }
        }
      } catch (error) {
        console.error('Error processing chunk:', error);
      }
    });

    response.data.on('end', () => {
      // Clean and send any remaining content in the buffer
      if (buffer) {
        const finalChunk = cleanResponse(buffer);
        if (finalChunk) {
          res.write(`data: ${JSON.stringify({ chunk: finalChunk })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    });

    req.on('close', () => {
      response.data.destroy();
    });

  } catch (error) {
    console.error('Chat error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to process chat request',
      details: error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Configured to connect to Ollama at ${OLLAMA_URL}`);
});