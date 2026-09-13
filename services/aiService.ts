// services/aiService.ts
// Conversational AI Assistant Engine for Chennai Public Transport (MTC, Metro, MRTS & UPI Ticketing)

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getAiTravelResponse = async (userInput: string): Promise<string> => {
  const query = userInput.toLowerCase().trim();

  // Try API if Groq key exists
  if (GROQ_KEY) {
    try {
      const payload = {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are Chennai Transit Assistant, a helpful, polite local transport expert in Chennai. Help passengers with MTC buses, Metro Blue/Green lines, MRTS local trains, unique bus sticker UPI ticketing, fares, and route directions."
          },
          { role: "user", content: userInput }
        ],
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn("External AI call failed, switching to local conversational engine.", e);
    }
  }

  // Conversational Smart Response Engine for Chennai Travel
  return generateLocalSmartResponse(query, userInput);
};

function generateLocalSmartResponse(query: string, rawInput: string): string {
  // Greetings & Tamil conversational phrases
  if (query.startsWith('hi') || query.startsWith('hello') || query.includes('vanakkam') || query.includes('hey')) {
    return `Vanakkam! 🙏 Welcome to Chennai Transit Assistant.\n\nI can help you with:\n• Direct MTC Bus routes & numbers (#21G, #47D, #570, #70V, #54, #G18)\n• Chennai Metro (Blue Line & Green Line) stations and fares\n• MRTS Local Trains (Beach ↔ Velachery) at flat ₹10 fare\n• Buying tickets via unique bus sticker codes & UPI (GPay/PhonePe)\n• Live crowd status and finding which bus is coming first\n\nWhere would you like to travel today in Chennai?`;
  }

  // Fares & Tickets
  if (query.includes('ticket') || query.includes('fare') || query.includes('price') || query.includes('buy') || query.includes('upi') || query.includes('sticker') || query.includes('cost')) {
    return `🚌 MTC Bus & Metro Fare Guide:\n\n1. MTC City Buses: ₹10 to ₹35 based on distance.\n2. Chennai Metro: ₹10 to ₹60 (20% discount on QR/cards).\n3. MRTS Local Trains: ₹10 flat fare anywhere between Beach ↔ Velachery.\n\n💡 How to Buy Tickets in this App:\nGo to the 'Tickets' tab ➔ Enter the unique bus sticker code (e.g., MTC-21G-01) ➔ Select boarding and destination stops ➔ Choose passenger count ➔ Pay instantly via UPI (GPay, PhonePe, Paytm)!`;
  }

  // Porur, Poonamallee, Non-Metro areas
  if (query.includes('porur') || query.includes('poonamallee') || query.includes('54')) {
    return `🚌 Travelling to/from Porur & Poonamallee:\n\n• Primary Mode: MTC Bus #54 / #54 Express (Broadway ↔ Poonamallee via Guindy, Porur).\n• Alternate Route: MTC Bus #70V from Koyambedu (CMBT).\n• Connecting Metro: Take Bus #54 from Porur to Vadapalani Metro or Guindy Metro station.`;
  }

  // OMR, Sholinganallur, Siruseri, IT Corridor
  if (query.includes('omr') || query.includes('sholinganallur') || query.includes('siruseri') || query.includes('570') || query.includes('19d')) {
    return `💻 Travelling along OMR IT Corridor:\n\n• Bus #570 Express: Koyambedu (CMBT) ↔ Siruseri IT Park (via Vadapalani, Guindy, Velachery, Sholinganallur).\n• Bus #19D: Adyar ↔ Sholinganallur (via Thiruvanmiyur, Taramani, Perungudi).\n• Train Feeder: Take MRTS train to Velachery or Taramani station, then board Bus #570 or #19D.`;
  }

  // Airport, Central, T. Nagar, CMBT, Guindy
  if (query.includes('airport') || query.includes('central') || query.includes('t. nagar') || query.includes('tnagar') || query.includes('cmbt') || query.includes('koyambedu') || query.includes('guindy')) {
    return `🚉 Major Transit Connections in Chennai:\n\n• Airport (MAA) ↔ Chennai Central: Take Metro Blue Line (30 mins, ₹40) or Suburban South Line from Trishulam.\n• Central ↔ T. Nagar: Take Suburban Train (Park Town ➔ Mambalam) or MTC Bus #21G / #B18.\n• CMBT Koyambedu ↔ Tambaram: Board MTC Bus #70V Express or Green Line Metro to Alandur.`;
  }

  // Metro or MRTS general questions
  if (query.includes('metro') || query.includes('mrts') || query.includes('train')) {
    return `🚆 Chennai Rail Systems:\n\n• Chennai Metro Blue Line: Airport ↔ Washermanpet ↔ Central (High speed, air-conditioned).\n• Chennai Metro Green Line: Central ↔ Egmore ↔ Koyambedu ↔ St. Thomas Mount.\n• MRTS Local Rail: Chennai Beach ↔ Chintadripet ↔ Mylapore ↔ Thiruvanmiyur ↔ Velachery (Flat ₹10 ticket).`;
  }

  // Crowdsource / Condition / Coming First
  if (query.includes('first') || query.includes('crowd') || query.includes('report') || query.includes('track') || query.includes('condition')) {
    return `🔍 Finding Buses Coming First:\n\nGo to the 'Crowdsourced Reports' tab ➔ Select 'Search Route Buses' ➔ Type your bus route name (e.g., '21G' or '570').\n\nThe app will list all live running buses sorted by ETA, highlighting the bus that is COMING FIRST with live crowd conditions!`;
  }

  // Help & Emergency
  if (query.includes('help') || query.includes('emergency') || query.includes('contact') || query.includes('number') || query.includes('police')) {
    return `🚨 Chennai Transport Emergency & Help Contacts:\n\n• MTC Helpline: 1800-425-5432\n• Chennai Metro Customer Care: 1800-425-1515\n• Emergency Ambulance: 108\n• Women Helpline / Safety: 1091\n• Police Control Room: 100\n\nYou can also enable 'Emergency Mode' in the app settings for quick emergency broadcasting.`;
  }

  // General query answer
  return `I understand you are asking about "${rawInput}".\n\nFor Chennai local travel:\n• Use the 'Find Route' tab to check accurate direct bus and metro connections for any two places in Chennai.\n• Use the 'Tickets' tab to enter a unique bus sticker code (e.g. MTC-21G-01) and pay via UPI.\n• Use 'Crowdsourced Reports' to view all running buses on a route sorted by arrival time.\n\nIs there a specific origin, destination, or bus line you'd like guidance on?`;
}
