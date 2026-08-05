import { NextResponse } from 'next/server';

// Simulated cryptocurrency data (in production, this would fetch from CoinGecko API)
const cryptoData = {
  bitcoin: { 
    id: 'bitcoin', 
    symbol: 'btc', 
    name: 'Bitcoin', 
    current_price: 67542.38, 
    price_change_percentage_24h: 2.34, 
    market_cap: 1324567890123, 
    total_volume: 28945678901,
    image: '₿',
    high_24h: 68123.45,
    low_24h: 65987.32,
    ath: 73750.00,
    atl: 100.00
  },
  ethereum: { 
    id: 'ethereum', 
    symbol: 'eth', 
    name: 'Ethereum', 
    current_price: 3456.78, 
    price_change_percentage_24h: 4.12, 
    market_cap: 415678901234, 
    total_volume: 15678901234,
    image: 'Ξ',
    high_24h: 3523.45,
    low_24h: 3345.67,
    ath: 4891.70,
    atl: 0.43
  },
  solana: { 
    id: 'solana', 
    symbol: 'sol', 
    name: 'Solana', 
    current_price: 178.92, 
    price_change_percentage_24h: -1.23, 
    market_cap: 82345678901, 
    total_volume: 3456789012,
    image: '◎',
    high_24h: 184.56,
    low_24h: 175.23,
    ath: 259.96,
    atl: 0.50
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get('coin') || 'all';
  
  // Add slight randomization to simulate live data
  const addVariation = (value: number, range: number) => {
    return value + (Math.random() - 0.5) * range;
  };

  if (coin === 'all') {
    const allCoins = Object.values(cryptoData).map(crypto => ({
      ...crypto,
      current_price: addVariation(crypto.current_price, crypto.current_price * 0.002),
      price_change_percentage_24h: addVariation(crypto.price_change_percentage_24h, 0.5),
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      source: 'AETH-1 Crypto Connector',
      data: allCoins,
      metadata: {
        total_coins: allCoins.length,
        last_updated: new Date().toISOString(),
        next_update_in_seconds: 30
      }
    });
  }

  const selectedCoin = cryptoData[coin as keyof typeof cryptoData];
  
  if (!selectedCoin) {
    return NextResponse.json(
      { 
        success: false, 
        error: `Cryptocurrency '${coin}' not found`,
        available_coins: Object.keys(cryptoData)
      }, 
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    source: 'AETH-1 Crypto Connector',
    data: {
      ...selectedCoin,
      current_price: addVariation(selectedCoin.current_price, selectedCoin.current_price * 0.002),
      price_change_percentage_24h: addVariation(selectedCoin.price_change_percentage_24h, 0.5),
      timestamp: new Date().toISOString()
    },
    metadata: {
      coin_id: coin,
      last_updated: new Date().toISOString()
    }
  });
}
