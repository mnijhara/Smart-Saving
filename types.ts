export interface CreditCard {
  id: string;
  name: string;
  issuer?: string;
  color?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ComparisonRow {
  cardName: string;
  categoryDetected: string;
  rewardRate: string;
  estimatedValue: number;
  explanation: string;
}

export interface RecommendationResult {
  recommendedCardId: string | null;
  recommendedCardName: string;
  reason: string;
  comparison: ComparisonRow[];
}

export interface AdvisorResponse {
  responseText: string;
  recommendation?: RecommendationResult;
  extractedCards?: string[]; // New: For auto-adding cards detected in chat
  sources?: GroundingSource[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendation?: RecommendationResult;
  sources?: GroundingSource[];
  timestamp: string;
}

export const PRESET_CARDS = [
  "HDFC Infinia Metal Edition",
  "HDFC Regalia Gold",
  "HDFC Millennia",
  "HDFC Diners Club Black",
  "SBI Cashback Card",
  "SBI Card ELITE",
  "Axis Bank Magnus",
  "Axis Bank Ace",
  "Axis Bank Vistara Infinite",
  "ICICI Amazon Pay Credit Card",
  "ICICI Sapphiro",
  "Flipkart Axis Bank Credit Card",
  "American Express Platinum Travel",
  "American Express Gold Card",
  "Standard Chartered Ultimate",
  "Tata Neu Infinity HDFC Bank",
  "Tata Neu Plus HDFC Bank",
  "IDFC First Select",
  "HSBC Cashback Credit Card"
];