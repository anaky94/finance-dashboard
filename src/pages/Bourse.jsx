import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyForm = { ticker: '', nom: '', quantite: '', cours_actuel: '', pru: '', yahoo_ticker: '' }

export default function Bourse() {
  const [positions, setPositions] = useState([])
  const [liquidites, setLiquidites] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [liqForm, setLiqForm] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editTicker, setEditTicker] = useState(null)
  const [message, setMessage] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('portefeuille').select('*').order('ticker')
    setPositions(data ?? [])
    const { data: liq } = await supabase.from('liquidites_pea').select('*').single()
    if (liq) setLiquidites(liq.montant)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const row = {
      ticker: form.ticker.toUpperCase(),
      nom: form.nom,
      quantite: parseInt(form.quantite),
      cours_actuel: parseFloat(form.cours_actuel),
      pru: parseFloat(form.pru),
      yahoo_ticker: form.yahoo_ticker || null
    }
    if (editTicker) {
      await supabase.from('portefeuille').update(row).eq('ticker', editTicker)
      setEditTicker(null)
    } else {
      await supabase.from('portefeuille').insert([row])
    }
    setForm(emptyForm)
    setLoading(false)
    load()
  }

  const handleEdit = (p) => {
    setEditTicker(p.ticker)
    setForm({
      ticker: p.ticker,
      nom: p.nom,
      quantite: String(p.quantite),
      cours_actuel: String(p.cours_actuel),
      pru: String(p.pru),
      yahoo_ticker: p.yahoo_ticker ?? ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (ticker) => {
    await supabase.from('portefeuille').delete().eq('ticker', ticker)
    load()
  }

  const handleLiq = async (e) => {
    e.preventDefault()
    await supabase.from('liquidites_pea').upsert([{ id: 1, montant: parseFloat(liqForm) }])
    setLiqForm('')
    load()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setMessage(null)
    try {
      const res = await fetch('/api/update-prices')
      const data = await res.json()
      if (data.updated) {
        setMessage(`✅ ${data.updated.length} cours mis à jour`)
        load()
      } else {
        setMessage(`⚠️ ${data.message ?? data.error}`)
      }
    } catch {
      setMessage('❌ Erreur lors de la mise à jour')
    }
    setRefreshing(false)
  }

  const totalTitres = positions.reduce((s, p) => s + p.quantite * p.cours_actuel, 0)
  const totalPV = positions.reduce((s, p) => s + p.quantite * (p.cours_actuel - p.pru), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">📈 Portefeuille PEA</h2>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {refreshing ? '⏳ Actualisation...' : '🔄 Actualiser les cours'}
        </button>
      </div>

      {message && (
        <div className="bg-slate-800 border border-slate-600 text-slate-300 rounded-lg px-4 py-2 text-sm">{message}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="📈 Titres" value={`${totalTitres.toFixed(2)} €`} />
        <StatCard label="💧 Liquidités" value={`${Number(liquidites).toFixed(2)} €`} />
        <StatCard label="💼 Total PEA" value={`${(totalTitres + Number(liquidites)).toFixed(2)} €`} color="text-indigo-400" />
        <StatCard label={totalPV >= 0 ? '✅ +/- latent' : '❌ +/- latent'} value={`${totalPV >= 0 ? '+' : ''}${totalPV.toFixed(2)} €`} color={totalPV >= 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Ticker', 'Nom', 'Qté', 'Cours (€)', 'PRU (€)', 'Valeur (€)', '+/- €', '+/- %', ''].map(h => (
                  <th key={h} className="text-left text-xs text-slate-400 font-medium px-3 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map(p => {
                const val = p.quantite * p.cours_actuel
                const pv = p.quantite * (p.cours_actuel - p.pru)
                const pct = ((p.cours_actuel - p.pru) / p.pru) * 100
                return (
                  <tr key={p.ticker} className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${editTicker === p.ticker ? 'bg-indigo-900/20' : ''}`}>
                    <td className="px-3 py-3 text-indigo-400 font-bold">{p.ticker}</td>
                    <td className="px-3 py-3 text-white">{p.nom}</td>
                    <td className="px-3 py-3 text-slate-300">{p.quantite}</td>
                    <td className="px-3 py-3 text-white">{Number(p.cours_actuel).toFixed(2)}</td>
                    <td className="px-3 py-3 text-slate-400">{Number(p.pru).toFixed(2)}</td>
                    <td className="px-3 py-3 text-white font-semibold">{val.toFixed(2)}</td>
                    <td className={`px-3 py-3 font-semibold ${pv >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pv >= 0 ? '+' : ''}{pv.toFixed(2)}</td>
                    <td className={`px-3 py-3 ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</td>
                    <td className="px-3 py-3 flex gap-1">
                      <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded border border-slate-600 hover:border-slate-400 transition-colors">✏️</button>
                      <button onClick={() => handleDelete(p.ticker)} className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-slate-600 hover:border-red-500 transition-colors">🗑️</button>
                    </td>
                  </tr>
                )
              })}
              {positions.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Aucune position</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">
              {editTicker ? `✏️ Modifier ${editTicker}` : 'Ajouter une position'}
            </h3>
            {[
              ['Ticker', 'ticker', 'ADYEN', !editTicker],
              ['Nom', 'nom', 'Adyen N.V.', true],
              ['Quantité', 'quantite', '2', true],
              ['Cours actuel €', 'cours_actuel', '858.80', true],
              ['PRU €', 'pru', '1257.30', true],
              ['Yahoo Ticker', 'yahoo_ticker', 'ADYEN.AS', true],
            ].map(([label, key, ph, editable]) => (
              <div key={key}>
                <label className="text-xs text-slate-400 block mb-1">
                  {label}{key === 'yahoo_ticker' && <span className="text-slate-500 ml-1">(pour maj auto)</span>}
                </label>
                <input
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph}
                  disabled={!editable}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
                  required={key !== 'yahoo_ticker'}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2 text-sm transition-colors disabled:opacity-50">
                {editTicker ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editTicker && (
                <button type="button" onClick={() => { setEditTicker(null); setForm(emptyForm) }}
                  className="px-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors">
                  ✕
                </button>
              )}
            </div>
          </form>

          <form onSubmit={handleLiq} className="bg-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">💧 Liquidités PEA</h3>
            <input type="number" step="0.01" value={liqForm} onChange={e => setLiqForm(e.target.value)}
              placeholder={`Actuel : ${Number(liquidites).toFixed(2)} €`}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
            <button type="submit" className="w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg py-2 text-sm transition-colors">
              Mettre à jour
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
