import { NextResponse } from 'next/server';

// Inspirational quotes database
const quotes = [
  {
    id: 1,
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation",
    tags: ["work", "passion", "success"]
  },
  {
    id: 2,
    content: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "leadership",
    tags: ["innovation", "leadership", "vision"]
  },
  {
    id: 3,
    content: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "inspiration",
    tags: ["dreams", "future", "belief"]
  },
  {
    id: 4,
    content: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "wisdom",
    tags: ["hope", "perseverance", "light"]
  },
  {
    id: 5,
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "perseverance",
    tags: ["success", "failure", "courage"]
  },
  {
    id: 6,
    content: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "action",
    tags: ["timing", "action", "growth"]
  },
  {
    id: 7,
    content: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    category: "life",
    tags: ["time", "authenticity", "life"]
  },
  {
    id: 8,
    content: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "motivation",
    tags: ["journey", "beginning", "possibility"]
  },
  {
    id: 9,
    content: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "opportunity",
    tags: ["difficulty", "opportunity", "perspective"]
  },
  {
    id: 10,
    content: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "confidence",
    tags: ["belief", "confidence", "achievement"]
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const random = searchParams.get('random') === 'true';
  
  let filteredQuotes = [...quotes];
  
  // Filter by category if specified
  if (category && category !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === category);
  }

  // Get random quote or return all
  let responseQuote;
  
  if (random || filteredQuotes.length === 1) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    responseQuote = filteredQuotes[randomIndex];
  } else {
    // Return multiple random quotes (up to 3)
    const shuffled = [...filteredQuotes].sort(() => Math.random() - 0.5);
    responseQuote = shuffled.slice(0, Math.min(3, shuffled.length));
  }

  return NextResponse.json({
    success: true,
    source: 'AETH-1 Quotes Connector',
    data: responseQuote,
    metadata: {
      total_quotes_available: quotes.length,
      categories: [...new Set(quotes.map(q => q.category))],
      last_updated: new Date().toISOString()
    }
  });
}
