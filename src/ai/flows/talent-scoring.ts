/**
 * @fileOverview A talent scoring AI agent.
 *
 * - calculateTalentScore - A function that handles the talent scoring process.
 * - CalculateTalentScoreInput - The input type for the calculateTalentScore function.
 * - CalculateTalentScoreOutput - The return type for the calculateTalentScore function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateTalentScoreInputSchema = z.object({
  profileData: z
    .string()
    .describe('The complete profile data of the student as a JSON string.'),
});

export type CalculateTalentScoreInput = z.infer<typeof CalculateTalentScoreInputSchema>;

const CalculateTalentScoreOutputSchema = z.object({
  talentScore: z
    .number()
    .describe(
      'A composite score representing the overall talent of the student, between 0 and 100.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of the factors that influenced the talent score, with specific examples from the profile data.'
    ),
});

export type CalculateTalentScoreOutput = z.infer<typeof CalculateTalentScoreOutputSchema>;

export async function calculateTalentScore(
  input: CalculateTalentScoreInput
): Promise<CalculateTalentScoreOutput> {
  return calculateTalentScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateTalentScorePrompt',
  input: {schema: CalculateTalentScoreInputSchema},
  output: {schema: CalculateTalentScoreOutputSchema},
  prompt: `You are an expert talent evaluator for Naxçıvan Dövlət Universiteti. Your task is to assess student profiles and assign a talent score based on the information provided.

Instructions:

1.  Analyze the student's profile data, paying close attention to their skills, projects, achievements, and social links.
2.  Assign a talent score between 0 and 100, where 0 indicates minimal talent and 100 indicates exceptional talent.
3.  Provide a clear and concise explanation of the factors that influenced the talent score. Include specific examples from the profile data to justify your assessment.
4.  Consider the following factors when assigning the talent score:
    *   Skills: The number and relevance of skills listed.
    *   Projects: The quality, complexity, and completeness of projects undertaken. Consider the student's role and the team members involved.
    *   Achievements: The level (International > Republic > Regional > University) and significance of awards and certifications received. A link to verify the achievement is a plus.
    *   Social Links: The completeness and professional quality of social media profiles (LinkedIn, GitHub, etc.).

Profile Data:
{{{profileData}}}

Output:
Talent Score: (0-100)
Reasoning: (Explanation of the talent score)`,
});

const calculateTalentScoreFlow = ai.defineFlow(
  {
    name: 'calculateTalentScoreFlow',
    inputSchema: CalculateTalentScoreInputSchema,
    outputSchema: CalculateTalentScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
