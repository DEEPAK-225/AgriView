
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Thermometer, Droplets, Leaf, AlertCircle, Loader2 } from 'lucide-react';
import { suggestCrop, type SuggestCropInput, type SuggestCropOutput } from '@/ai/flows/crop-suggestion';

// Zod schema for form validation, matching SuggestCropInput
const formSchema = z.object({
  temperature: z.coerce.number().min(-50, "Temperature too low").max(100, "Temperature too high"),
  humidity: z.coerce.number().min(0, "Humidity must be 0% or more").max(100, "Humidity must be 100% or less"),
  soilMoisture: z.coerce.number().min(0, "Soil moisture must be 0% or more").max(100, "Soil moisture must be 100% or less"),
});

export function AICropAdviser() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestCropOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temperature: 25, // Default temperature
      humidity: 60,    // Default humidity
      soilMoisture: 50, // Default soil moisture
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      // Ensure values are correctly typed for the AI flow
      const result = await suggestCrop(values as SuggestCropInput);
      setSuggestion(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred while fetching crop suggestion.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          AI Crop Adviser
        </CardTitle>
        <CardDescription>
          Enter environmental conditions to get an AI-powered crop suggestion.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-sm">
                    <Thermometer className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    Temperature (°C)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="humidity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-sm">
                    <Droplets className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    Humidity (%)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="soilMoisture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-sm">
                    <Leaf className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    Soil Moisture (%)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Suggestion"
              )}
            </Button>
          </form>
        </Form>

        {error && !isLoading && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Suggestion Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      {suggestion && !isLoading && (
        <CardFooter className="mt-auto border-t pt-4">
          <Alert variant="default" className="w-full bg-secondary/30">
            <Sparkles className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">
              AI Suggestion: {suggestion.cropSuggestion}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm">
              {suggestion.reason}
            </AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
}
