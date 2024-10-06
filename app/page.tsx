"use client"

import { useState } from 'react';

export default function Home() {
  const [dealerCard, setDealerCard] = useState('');
  const [playerCards, setPlayerCards] = useState(['', '']);
  const [advice, setAdvice] = useState('');
  const [cashoutAvailable, setCashoutAvailable] = useState(false);

  type CardKey = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

  const cardValues :  Record<CardKey, number> = {
    'A': 11,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 10,
    'Q': 10,
    'K': 10,
  };
  
  const convertCard = (card : string) => {
    return cardValues[card.toUpperCase() as CardKey] || 0;
  };
  
  const calculateHandTotal = (cards: string[]): number => {
    let total = 0;
    let aceCount = 0;
  
    cards.forEach((card : string) => {
      const value = convertCard(card);
      total += value;
      if (card.toUpperCase() === 'A') {
        aceCount += 1;
      }
    });
  
    // Adjust for Aces
    while (total > 21 && aceCount > 0) {
      total -= 10; // Counting Ace as 1 instead of 11
      aceCount -= 1;
    }
  
    return total;
  };
  
  const dealerBustProbabilities  : Record<number, number>= {
    2: 0.35,
    3: 0.37,
    4: 0.40,
    5: 0.42,
    6: 0.42,
    7: 0.26,
    8: 0.24,
    9: 0.23,
    10: 0.21,
    11: 0.11, // Ace
  };
  
  const getDealerBustProbability = (dealerCardValue : number) => {
    return dealerBustProbabilities[dealerCardValue] || 0;
  };
  
  const calculateBustProbability = (playerTotal : number):number => {
    const remainingCards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Simplified for demonstration
    let bustingCards = remainingCards.filter(
      (cardValue) => playerTotal + cardValue > 21
    ).length;
    return bustingCards / remainingCards.length;
  };
  

  const getAdvice = (dealerCard : string, playerCards : string[], cashoutAvailable : boolean) => {
    // Convert card inputs to numerical values
    const dealerValue = convertCard(dealerCard);
    const playerValues = playerCards.map(convertCard);
  
    // Calculate player's hand total
    const playerTotal = calculateHandTotal(playerCards);
  
    // Check for pairs (possible split)
    const isPair =
      playerValues.length === 2 && playerValues[0] === playerValues[1];
  
    // Check for soft total (hand contains an Ace counted as 11)
    const hasAce = playerCards.some((card: string) => card.toUpperCase() === 'A');
    const softTotal = hasAce && playerTotal <= 21;
  
    // Calculate probabilities
    const playerBustProb = calculateBustProbability(playerTotal);
    const dealerBustProb = getDealerBustProbability(dealerValue);
  
    // Expected Value (simplified estimation)
    const expectedPlayerWinProb = 1 - playerBustProb;
    const expectedDealerWinProb = 1 - dealerBustProb;
  
    // Decision Logic
    let recommendation = '';
  
    if (cashoutAvailable) {
      // Cashout Logic
      if (expectedPlayerWinProb < expectedDealerWinProb) {
        recommendation = 'Cash Out';
        return recommendation;
      }
    }
  
    // Doubling Down Logic
    if (playerCards.length === 2) {
      // Hard Totals
      if (!hasAce) {
        if (playerTotal === 11 && dealerValue !== 11) {
          recommendation = 'Double Down';
          return recommendation;
        }
        if (playerTotal === 10 && dealerValue >= 2 && dealerValue <= 9) {
          recommendation = 'Double Down';
          return recommendation;
        }
        if (playerTotal === 9 && dealerValue >= 3 && dealerValue <= 6) {
          recommendation = 'Double Down';
          return recommendation;
        }
      } else {
        // Soft Totals
        if (playerTotal === 17 && dealerValue >= 3 && dealerValue <= 6) {
          recommendation = 'Double Down';
          return recommendation;
        }
        if (playerTotal === 18 && dealerValue >= 3 && dealerValue <= 6) {
          recommendation = 'Double Down';
          return recommendation;
        }
        if (playerTotal >= 13 && playerTotal <= 16 && dealerValue >= 4 && dealerValue <= 6) {
          recommendation = 'Double Down';
          return recommendation;
        }
      }
    }
  
    if (isPair) {
      const pairValue = playerValues[0];
      if (pairValue === 8 || pairValue === 11) {
        recommendation = 'Split'; // Always split Aces and 8s
      } else if (pairValue === 10 || pairValue === 5) {
        recommendation = 'Stand'; // Never split 10s or 5s
      } else if (pairValue === 9) {
        if (dealerValue === 7 || dealerValue >= 10 || dealerValue === 11) {
          recommendation = 'Stand';
        } else {
          recommendation = 'Split';
        }
      } else {
        // Additional split rules
        if (pairValue >= 2 && pairValue <= 7 && dealerValue >= 2 && dealerValue <= 7) {
          recommendation = 'Split';
        } else {
          recommendation = 'Hit';
        }
      }
    } else {
      // Decision to Hit or Stand
      if (playerTotal >= 17) {
        recommendation = 'Stand';
      } else if (playerTotal <= 11) {
        recommendation = 'Hit';
      } else {
        if (dealerValue >= 7 || dealerValue === 11) {
          if (playerBustProb < 0.5) {
            recommendation = 'Hit';
          } else {
            recommendation = 'Stand';
          }
        } else {
          if (dealerBustProb > 0.4) {
            recommendation = 'Stand';
          } else {
            recommendation = 'Hit';
          }
        }
      }
    }
  
    // Include Cashout in the recommendation if it's a better option
    if (cashoutAvailable && recommendation === 'Hit' && playerBustProb > 0.5) {
      recommendation = 'Consider Cashing Out';
    }
  
    return recommendation;
  };
  
  
  
  
  
  

  const handleSubmit = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const recommendation = getAdvice(dealerCard, playerCards, cashoutAvailable);
    setAdvice(`Recommended Action: ${recommendation}`);
  };
  const cardOptions = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Blackjack Strategy Advisor
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Dealer's Card:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded text-[blue]"
              value={dealerCard}
              onChange={(e) => setDealerCard(e.target.value)}
            >
              <option value="">Select Dealer's Card</option>
              {cardOptions.map((card) => (
                <option key={card} value={card}>
                  {card}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Cards:</label>
            <div className="flex space-x-2">
              <select
                className="w-1/2 p-2 border border-gray-300 rounded text-[blue]"
                value={playerCards[0]}
                onChange={(e) => setPlayerCards([e.target.value, playerCards[1]])}
              >
                <option value="">Select Card</option>
                {cardOptions.map((card) => (
                  <option key={card} value={card}>
                    {card}
                  </option>
                ))}
              </select>
              <select
                className="w-1/2 p-2 border border-gray-300 rounded text-[blue]"
                value={playerCards[1]}
                onChange={(e) => setPlayerCards([playerCards[0], e.target.value])}
              >
                <option value="">Select Card</option>
                {cardOptions.map((card) => (
                  <option key={card} value={card}>
                    {card}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4 flex items-center">
            <label className="block text-gray-700 mr-2">Cashout Option Available:</label>
            <input
              type="checkbox"
              checked={cashoutAvailable}
              onChange={(e) => setCashoutAvailable(e.target.checked)}
              className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Get Advice
          </button>
        </form>
        {advice && (
          <h2 className="mt-6 text-xl font-semibold text-center text-green-600">{advice}</h2>
        )}
      </div>
    </div>
  );
}
