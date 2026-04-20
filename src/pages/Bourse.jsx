import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Bourse() {
  const [positions, setPositions] = useState([])
  const [liquidites, setLiquidites] = useState(0)
  const [form, setForm] = useState({ ticker: '', nom: '', quantite: '', cours_actuel: '', pru: '' })
  const [liqForm, setLiqForm] = useState('')
  const [loading, setLoading] = useState(false)

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
    const exists = positions.find(p => p.ticker === form.ticker.toUpperCase())
    const row = { ticker: form.ticker.toUpperCase(), nom: form.nom, quantite: parseInt(form.quantite), cours_actuel: parseFloat(form.cours_actuel), pru: parseFloat(form.pru) }
    if (exists) await supabase.from('portefeuille').update(row).eq('ticker', row.ticker)
    else await supabase.from('portefeuille').insert([row])
    setForm({ ticker: '', nom: '', quantite: '', cours_actuel: '', pru: '' })
    setLoading(false)
    load()
  }

  const handleDelete = async (ticker) => {
    await supabase.from('portefeuille').delete().eq('ticker', ticker)
    load()
  }

  const handleLiq = async (e) => {
    e.preventDefault()
    await supabase.from('liquidites_pea').upsert([{ id: 1, montant: parseFloat(liqForm) }])
    load()
  }

  const totalTitres = positions.reduce((s, p) => s + p.quantite * p.cours_actuel, 0)
  const totalPV = positions.reduce((s, p) => s + p.quantite * (p.cours_actuel - p.pru), 0)
  const totalInvesti = positions.reduce((s, p) => s + p.quantite * p.pru, 0)

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">📈 Portefeuille PEA</h2>

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
                  <tr key={p.ticker} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-3 py-3 text-indigo-400 font-bold">{p.ticker}</td>
                    <td className="px-3 py-3 text-white">{p.nom}</td>
                    <td className="px-3 py-3 text-slate-300">{p.quantite}</td>
                    <td className="px-3 py-3 text-white">{Number(p.cours_actuel).toFixed(2)}</td>
                    <td className="px-3 py-3 text-slate-400">{Number(p.pru).toFixed(2)}</td>
                    <td className="px-3 py-3 text-white font-semibold">{val.toFixed(2)}</td>
                    <td className={`px-3 py-3 font-semibold ${pv >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pv >= 0 ? '+' : ''}{pv.toFixed(2)}</td>
                    <td className={`px-3 py-3 ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</td>
                    <td className="px-3 py-3">
                      <button onClick={() => handleDelete(p.ticker)} className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-slate-600">🗑️</button>
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
            <h3 className="text-sm font-semibold text-white">Ajouter / Mettre à jour</h3>
            {[['Ticker', 'ticker', 'ADYEN'], ['Nom', 'nom', 'Adyen N.V.'], ['Quantité', 'quantite', '2'], ['Cours actuel €', 'cours_actuel', '858.80'], ['PRU €', 'pru', '1257.30']].map(([label, key, ph]) => (
              <div key={key}>
                <label className="text-xs text-slate-400 block mb-1">{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2 text-sm transition-colors">
              Enregistrer
            </button>
          </form>

          <form onSubmit={handleLiq} className="bg-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">💧 Liquidités PEA</h3>
            <input type="number" step="0.01" value={liqForm} onChange={e => setLiqForm(e.target.value)} placeholder={String(liquidites)}
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
