import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, getCategoryLabel } from '../lib/categories'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

export default function Dashboard() {
  const now = new Date()
  const [mois, setMois] = useState(now.getMonth() + 1)
  const [annee, setAnnee] = useState(now.getFullYear())
  const [depenses, setDepenses] = useState([])
  const [revenus, setRevenus] = useState([])
  const [portfolio, setPortfolio] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('depenses').select('*').eq('mois', mois).eq('annee', annee),
      supabase.from('revenus').select('*').eq('mois', mois).eq('annee', annee),
      supabase.from('portefeuille').select('*'),
    ]).then(([d, r, p]) => {
      setDepenses(d.data ?? [])
      setRevenus(r.data ?? [])
      setPortfolio(p.data ?? [])
    })
  }, [mois, annee])

  const [liquidites, setLiquidites] = useState(0)

  useEffect(() => {
    supabase.from('liquidites_pea').select('*').single().then(({ data }) => {
      if (data) setLiquidites(data.montant)
    })
  }, [])

  const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0)
  const totalRevenus = revenus.reduce((s, r) => s + Number(r.montant), 0)
  const solde = totalRevenus - totalDepenses
  const totalTitres = portfolio.reduce((s, p) => s + p.quantite * p.cours_actuel, 0)
  const totalPV = portfolio.reduce((s, p) => s + p.quantite * (p.cours_actuel - p.pru), 0)
  const totalPEA = totalTitres + Number(liquidites)

  const budgetData = CATEGORIES.map(cat => {
    const depense = depenses.filter(d => d.categorie === cat.id).reduce((s, d) => s + Number(d.montant), 0)
    return { name: cat.label.split(' ').slice(1).join(' '), budget: cat.budget, depense: parseFloat(depense.toFixed(2)) }
  }).filter(c => c.budget > 0 || c.depense > 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tableau de bord</h2>
        <div className="flex gap-2">
          <select
            value={mois}
            onChange={e => setMois(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm"
          >
            {MOIS_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={annee}
            onChange={e => setAnnee(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="💸 Dépenses" value={`${totalDepenses.toFixed(2)} €`} color="text-red-400" />
        <StatCard label="💰 Revenus" value={`${totalRevenus.toFixed(2)} €`} color="text-green-400" />
        <StatCard label="⚖️ Solde" value={`${solde.toFixed(2)} €`} color={solde >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="💼 PEA Total" value={`${totalPEA.toFixed(2)} €`} color="text-indigo-400" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">🎯 Budget par catégorie</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="budget" name="Budget" fill="#334155" radius={[0, 4, 4, 0]} />
              <Bar dataKey="depense" name="Dépensé" radius={[0, 4, 4, 0]}>
                {budgetData.map((entry, i) => (
                  <Cell key={i} fill={entry.depense > entry.budget ? '#ef4444' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">💸 Dernières dépenses</h3>
          <div className="space-y-2">
            {depenses.slice(-8).reverse().map(d => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white font-medium">{d.libelle}</span>
                  <span className="ml-2 text-xs text-slate-500">{getCategoryLabel(d.categorie)}</span>
                </div>
                <span className="text-red-400 font-semibold">{Number(d.montant).toFixed(2)} €</span>
              </div>
            ))}
            {depenses.length === 0 && <p className="text-slate-500 text-sm">Aucune dépense ce mois</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">📈 Portefeuille PEA</h3>
          <div className="flex gap-4 text-xs">
            <span className="text-slate-400">Titres : <span className="text-white font-semibold">{totalTitres.toFixed(2)} €</span></span>
            <span className="text-slate-400">Liquidités : <span className="text-white font-semibold">{Number(liquidites).toFixed(2)} €</span></span>
            <span className="text-slate-400">+/- latent : <span className={`font-semibold ${totalPV >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalPV >= 0 ? '+' : ''}{totalPV.toFixed(2)} €</span></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Ticker', 'Nom', 'Qté', 'Cours (€)', 'PRU (€)', 'Valeur (€)', '+/- €', '+/- %'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-400 font-medium px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {portfolio.map(p => {
                const val = p.quantite * p.cours_actuel
                const pv = p.quantite * (p.cours_actuel - p.pru)
                const pct = ((p.cours_actuel - p.pru) / p.pru) * 100
                return (
                  <tr key={p.ticker} className="border-b border-slate-700/50">
                    <td className="px-3 py-2.5 text-indigo-400 font-bold">{p.ticker}</td>
                    <td className="px-3 py-2.5 text-white">{p.nom}</td>
                    <td className="px-3 py-2.5 text-slate-300">{p.quantite}</td>
                    <td className="px-3 py-2.5 text-white">{Number(p.cours_actuel).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-slate-400">{Number(p.pru).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-white font-semibold">{val.toFixed(2)}</td>
                    <td className={`px-3 py-2.5 font-semibold ${pv >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pv >= 0 ? '+' : ''}{pv.toFixed(2)}</td>
                    <td className={`px-3 py-2.5 ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
