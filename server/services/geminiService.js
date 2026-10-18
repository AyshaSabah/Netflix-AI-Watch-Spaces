import { GoogleGenAI } from '@google/genai';

let aiClient = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
};

/**
 * Ask Gemini Co-Pilot about the movie and current scene.
 */
export const askGeminiCopilot = async ({
  movieTitle,
  movieDescription,
  movieGenre,
  director,
  cast,
  timelineTrivia = [],
  currentTimestamp = 0,
  userQuestion,
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(currentTimestamp);

  // Compile nearby trivia and scene context
  const relevantTrivia = timelineTrivia
    .filter((t) => Math.abs(t.timestamp - currentTimestamp) <= 45)
    .map((t) => `[Scene Trivia at ${t.timeFormatted || formatTime(t.timestamp)}: "${t.title}" - ${t.trivia}]`)
    .join('\n');

  const contextPrompt = `
You are the "Netflix Watch Spaces AI Co-Pilot", a friendly, charismatic movie enthusiast watching alongside friends in a social watch room.
You are watching: "${movieTitle}" (${movieGenre})
Director: ${director || 'Unknown'}
Cast: ${Array.isArray(cast) ? cast.join(', ') : 'Cast Ensemble'}
Plot Summary: ${movieDescription}
Current Playback Position: ${formattedTime} (${Math.round(currentTimestamp)} seconds into the film).

${relevantTrivia ? `Contextual Trivia for this moment in the film:\n${relevantTrivia}\n` : ''}

User's Question: "${userQuestion}"

Instructions:
1. Answer concisely (2 to 4 sentences maximum).
2. Reference the movie details and current playback scene when relevant.
3. Be enthusiastic, witty, and friendly, like a companion in a theater.
4. If asked about spoilers far ahead, give a playful teaser without ruining major twists unless the user explicitly asks for spoilers.
`.trim();

  const ai = getAIClient();

  if (!ai) {
    // If no GEMINI_API_KEY is configured in the environment, provide a smart contextual fallback
    return `🍿 [AI Co-Pilot]: Watching "${movieTitle}" at ${formattedTime}! ${
      relevantTrivia ? relevantTrivia.replace(/\[|\]/g, '') + ' ' : ''
    }Regarding "${userQuestion}": In ${movieGenre.toLowerCase()} films like this, details at this timestamp build up key plot tension. (To enable live Gemini AI generation, ensure GEMINI_API_KEY is provided in your secrets/environment).`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: 'You are the Netflix Watch Spaces AI Co-Pilot. Answer movie questions warmly, concisely (2-4 sentences), and accurately based on provided movie facts.',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (text && text.trim().length > 0) {
      return text.trim();
    }
    return `🍿 That's an interesting question about ${movieTitle}! At ${formattedTime}, the story is advancing nicely. Keep your eyes on the character cues!`;
  } catch (err) {
    console.error('Gemini Co-Pilot error:', err.message);
    // Helpful graceful answer
    return `🍿 [AI Co-Pilot]: Great question about "${movieTitle}"! Right now at ${formattedTime}, the scene is in full swing. ${
      relevantTrivia ? relevantTrivia.replace(/\[|\]/g, '') : 'Notice the lighting and background details!'
    }`;
  }
};
