// src/app/api/genkit/[...flow]/route.ts
import '@/ai/dev'; // Ensure flows are loaded
import { appRoute } from '@genkit-ai/next';

export const { GET, POST } = appRoute();
