import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: "AIzaSyAcyDXIDC49sGBYvu10ih6LrVCvdLKNNvo",
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
