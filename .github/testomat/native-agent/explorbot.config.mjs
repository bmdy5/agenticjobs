import { createOpenAI } from '@ai-sdk/openai';

const provider = createOpenAI({
  apiKey: process.env.TRIAL_MODEL_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});
const model = provider.chat('openai/gpt-4.1');

export default {
  web: { url: 'http://127.0.0.1:4187' },
  ai: {
    model,
    agenticModel: model,
    visionModel: model,
    agents: {
      analyst: { enabled: true },
      historian: { screencast: true, framework: 'playwright' },
    },
  },
  reporter: { html: true, markdown: true },
};
