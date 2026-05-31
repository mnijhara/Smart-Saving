import { GoogleGenAI } from "@google/genai";
import { CreditCard, AdvisorResponse, GroundingSource, RecommendationResult } from "../types";

// The model gemini-3-flash-preview supports Google Search grounding
const modelName = 'gemini-3-flash-preview';

/**
 * Sends a message to the Gemini advisor.
 * Includes a fallback mechanism: if search grounding fails, it retries without tools.
 */
export const sendMessageToAdvisor = async (
  cards: CreditCard[],
  userMessage: string,
  isRetry = false
): Promise<AdvisorResponse> => {
  if (!process.env.API_KEY) {
    return { responseText: "API Key is missing. Please check your deployment." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cardNames = cards.length > 0 ? cards.map(c => c.name).join(", ") : "No cards added yet";
  
  const systemInstruction = `
    You are 'smartsaving.cards', an elite financial strategy AI for India.
    USER WALLET: [${cardNames}]

    CORE OBJECTIVE:
    Identify the absolute best payment method for the user's specific purchase query.
    Prioritize "Instant Bank Discounts" over "Reward Points".

    STRICT FORMATTING:
    1. SUMMARY: Max 60 words conversational text.
    2. JSON BLOCK: At the very end, strictly as follows:
    \`\`\`json
    {
      "extractedCards": [],
      "recommendation": {
        "recommendedCardName": "Best Card Name",
        "reason": "Short benefit",
        "comparison": [
          {"cardName": "Card Name", "categoryDetected": "Merchant", "rewardRate": "10% Off", "estimatedValue": 1000, "explanation": "Discount info"}
        ]
      }
    }
    \`\`\`
  `;

  try {
    const config: any = {
      systemInstruction,
      temperature: 0.2,
    };

    // Only use search tools on the first attempt
    if (!isRetry) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userMessage,
      config
    });

    const rawText = response.text || "";
    if (!rawText) throw new Error("Empty response from AI");
    
    // Extract search grounding sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          if (!sources.find(s => s.uri === chunk.web.uri)) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
        }
      });
    }

    let recommendation: RecommendationResult | undefined;
    let extractedCards: string[] | undefined;
    let displayText = rawText;
    
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
    const matches = [...rawText.matchAll(jsonRegex)];
    
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      try {
        const parsed = JSON.parse(lastMatch[1].trim());
        recommendation = parsed.recommendation;
        extractedCards = parsed.extractedCards;
        displayText = rawText.replace(jsonRegex, '').trim();
      } catch (e) {
        console.error("JSON Parse Error", e);
      }
    }

    return { 
      responseText: displayText,
      recommendation,
      extractedCards,
      sources 
    };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Fallback logic: If it failed with search tools, try once more without tools
    if (!isRetry && !error.message?.includes("safety")) {
      console.log("Retrying without search grounding...");
      return sendMessageToAdvisor(cards, userMessage, true);
    }

    if (error.message?.includes("safety")) {
      return { responseText: "I can only discuss financial rewards and card advice. Please try a different query." };
    }
    
    return { responseText: "I'm having a temporary connection issue. Please try your request again in a few seconds." };
  }
};