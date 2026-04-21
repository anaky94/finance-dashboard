import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { data: positions, error } = await supabase
    .from('portefeuille')
    .select('ticker, yahoo_ticker')

  if (error) return res.status(500).json({ error: error.message })

  const validPositions = positions.filter(p => p.yahoo_ticker)
  if (validPositions.length === 0) return res.status(200).json({ message: 'Aucun yahoo_ticker configuré' })

  const symbols = validPositions.map(p => p.yahoo_ticker).join(',')

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const data = await response.json()
    const quotes = data?.quoteResponse?.result ?? []

    const updates = []
    for (const quote of quotes) {
      const position = validPositions.find(p => p.yahoo_ticker === quote.symbol)
      if (position && quote.regularMarketPrice) {
        const { error: updateError } = await supabase
          .from('portefeuille')
          .update({ cours_actuel: quote.regularMarketPrice, updated_at: new Date().toISOString() })
          .eq('ticker', position.ticker)
        updates.push({ ticker: position.ticker, prix: quote.regularMarketPrice, error: updateError?.message })
      }
    }

    res.status(200).json({ updated: updates })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
