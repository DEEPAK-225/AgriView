
'use server';

/**
 * @fileOverview An AI agent for suggesting crops based on sensor readings.
 *
 * - suggestCrop - A function that suggests a crop based on temperature, humidity, and soil moisture.
 * - SuggestCropInput - The input type for the suggestCrop function.
 * - SuggestCropOutput - The return type for the suggestCrop function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';


// Define the input schema using Zod (no longer exported)
const SuggestCropInputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  humidity: z.number().describe('The current humidity percentage.'),
  soilMoisture: z.number().describe('The current soil moisture percentage.'),
});
export type SuggestCropInput = z.infer<typeof SuggestCropInputSchema>; // Export only the type

// Define the output schema using Zod (no longer exported)
const SuggestCropOutputSchema = z.object({
  cropSuggestion: z.string().describe('The suggested crop to plant.'),
  reason: z.string().describe('The reason for suggesting the crop based on the sensor readings.'),
});
export type SuggestCropOutput = z.infer<typeof SuggestCropOutputSchema>; // Export only the type


// Define the prompt for the AI model
const suggestCropPrompt = ai.definePrompt({
  name: 'suggestCropPrompt',
  input: {
    schema: SuggestCropInputSchema, // Use the internal schema
  },
  output: {
    schema: SuggestCropOutputSchema, // Use the internal schema
  },
  prompt: `You are an AI crop advisor. Based on the sensor readings provided, suggest the most suitable crop to plant and explain your reasoning.\n\nSensor Readings:\nTemperature: {{{temperature}}}°C\nHumidity: {{{humidity}}}%\nSoil Moisture: {{{soilMoisture}}}%\n\nConsider these simple seasonal averages and conditions (ignore specific thresholds for now, focus on the general idea):\n- Rice: Thrives in warm temperatures (e.g., >25°C) and high humidity (e.g., >70%). Needs ample water (high soil moisture).\n- Wheat: Prefers moderate temperatures (e.g., 15-25°C) and moderate humidity. Tolerates drier conditions than rice.\n- Corn: Adaptable, but generally likes warm temperatures (e.g., 20-30°C) and good soil moisture. Can handle a range of humidity.\n\nBased ONLY on the provided Temperature, Humidity, and Soil Moisture, what single crop would be most appropriate? Provide a brief justification based on these factors.`,
});


// Define the Genkit flow using the ai instance
const suggestCropFlow = ai.defineFlow<
  typeof SuggestCropInputSchema,
  typeof SuggestCropOutputSchema
>(
  {
    name: 'suggestCropFlow',
    inputSchema: SuggestCropInputSchema, // Use the internal schema
    outputSchema: SuggestCropOutputSchema, // Use the internal schema
  },
  async (input) => {
    const llmResponse = await suggestCropPrompt(input);
    // In Genkit 1.x, use .output directly
    const output = llmResponse.output;

    if (!output) {
       throw new Error("LLM failed to return structured output.");
    }

    return output;
  }
);


// Export the server action function to be called from the client
export async function suggestCrop(input: SuggestCropInput): Promise<SuggestCropOutput> {
   console.log("Running suggestCrop flow with input:", input);
   try {
      // In Genkit 1.x, flows are directly callable
      const result = await suggestCropFlow(input);
      console.log("SuggestCrop flow result:", result);
      return result;
   } catch (error) {
      console.error("Error running suggestCrop flow:", error);
      // Provide a more informative error or a fallback response
      throw new Error(`Failed to get crop suggestion: ${error instanceof Error ? error.message : String(error)}`);
   }
}
