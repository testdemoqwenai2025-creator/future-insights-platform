import { NextResponse } from 'next/server';

// Interesting and fun facts database
const facts = [
  {
    id: 1,
    fact: "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still perfectly edible.",
    category: "food",
    source: "National Geographic"
  },
  {
    id: 2,
    fact: "Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, while one pumps it to the rest of the body.",
    category: "nature",
    source: "Marine Biology Institute"
  },
  {
    id: 3,
    fact: "A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
    category: "space",
    source: "NASA"
  },
  {
    id: 4,
    fact: "The human brain can store an estimated 2.5 petabytes of information, which is roughly equivalent to 3 million hours of TV shows.",
    category: "science",
    source: "Stanford University"
  },
  {
    id: 5,
    fact: "Bananas are berries, but strawberries aren't. Botanically, a berry must come from a single flower with one ovary.",
    category: "nature",
    source: "Botanical Society"
  },
  {
    id: 6,
    fact: "The shortest war in history lasted between 38 to 45 minutes. It was fought between Britain and Zanzibar in 1896.",
    category: "history",
    source: "Guinness World Records"
  },
  {
    id: 7,
    fact: "Cows have best friends and get stressed when they are separated from them.",
    category: "animals",
    source: "Animal Behavior Studies"
  },
  {
    id: 8,
    fact: "The Eiffel Tower can grow by up to 6 inches in summer due to thermal expansion of the metal.",
    category: "engineering",
    source: "Structural Engineering"
  },
  {
    id: 9,
    fact: "There are more possible iterations of a game of chess than atoms in the observable universe.",
    category: "mathematics",
    source: "Mathematical Society"
  },
  {
    id: 10,
    fact: "A group of flamingos is called a 'flamboyance'.",
    category: "language",
    source: "Ornithology Dictionary"
  },
  {
    id: 11,
    fact: "The world's largest living organism is a fungus in Oregon that spans 2,385 acres.",
    category: "nature",
    source: "Forest Service"
  },
  {
    id: 12,
    fact: "Lightning strikes the Earth about 8.6 million times per day.",
    category: "weather",
    source: "National Weather Service"
  },
  {
    id: 13,
    fact: "The average person will spend six months of their life waiting at red lights.",
    category: "society",
    source: "Traffic Studies"
  },
  {
    id: 14,
    fact: "A jiffy is 1/100th of a second.",
    category: "science",
    source: "Physics Dictionary"
  },
  {
    id: 15,
    fact: "The first computer programmer was Ada Lovelace, who wrote algorithms for Charles Babbage's Analytical Engine in the 1840s.",
    category: "technology",
    source: "Computer History Museum"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const random = searchParams.get('random') !== 'false'; // Default to random
  
  let filteredFacts = [...facts];
  
  // Filter by category if specified
  if (category && category !== 'all') {
    filteredFacts = facts.filter(f => f.category === category);
  }

  // Get random fact or return all
  let responseData;
  
  if (random) {
    const randomIndex = Math.floor(Math.random() * filteredFacts.length);
    responseData = filteredFacts[randomIndex];
  } else {
    responseData = filteredFacts;
  }

  return NextResponse.json({
    success: true,
    source: 'AETH-1 Facts Connector',
    data: responseData,
    metadata: {
      total_facts_available: facts.length,
      categories: [...new Set(facts.map(f => f.category))],
      last_updated: new Date().toISOString(),
      fun_fact_of_the_day: facts[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % facts.length]
    }
  });
}
