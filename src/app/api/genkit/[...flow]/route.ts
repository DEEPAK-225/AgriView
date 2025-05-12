// src/app/api/genkit/[...flow]/route.ts
import '@/ai/dev'; // Ensure flows are loaded
import { genkitApiHandler } from '@genkit-ai/next/plugin';

export const { GET, POST } = genkitApiHandler();
