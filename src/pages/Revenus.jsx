import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PROPRIETAIRES, getProprietaire } from '../lib/proprietaires'

const CATS = ['💰 Salaire', '💰 Freelance', '💰 Virement reçu', '📈 Dividendes', '🏛️ CAF', '📦 Autre']
const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const today = () => new Date().toISOString().split('T')[0]

export default function Revenus() {
  const now = new Date()
  const [mois, setMois] = useState(now.getMonth() + 1)
  const [annee, setAnnee] = useState(now.getFullYear())
  const [revenus, setRevenus] = useState([])
  const [filtreProp, setFiltreProp] = useState('tous')
  const [form, setForm] = useState({ date: today(), libelle: '', montant: '', categorie: '💰 Virement reçu', notes: '', proprietaire: 'konan' })
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('revenus').select('*').eq('mois', mois).eq('annee', annee).order('date', { ascending: false })
    setRevenus(data ?? [])
  }

  useEffect(() => { load() }, [mois, annee])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const d = new Date(form.date)
    const row = { ...form, montant: parseFloat(form.montant), mois: d.getMonth() + 1, annee: d.getFullYear() }
    if (editId) {
      await supabase.from('revenus').update(row).eq('id', editId)
      setEditId(null)
    } else {
      await supabase.from('revenus').insert([row])
    }
    setForm({ date: today(), libelle: '', montant: '', categorie: '💰 Virement reçu', notes: '', proprietaire: 'konan' })
    setLoading(false)
    load()
  }

  const handleDelete = async (id) => {
    await supabase.from('revenus').delete().eq('id', id)
    load()
  }

  const handleEdit = (r) => {
    setEditId(r.id)
    setForm({ date: r.date, libelle: r.libelle, montant: String(r.montant), categorie: r.categorie, notes: r.notes ?? '', proprietaire: r.proprietaire ?? 'konan' })
  }

  const revenusFiltres = filtreProp === 'tous' ? revenus : revenus.filter(r => (r.proprietaire ?? 'konan') === filtreProp)
  const total = revenusFiltres.reduce((s, r) => s + Number(r.montant), 0)

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <h2 className="text-2xl font-bold text-white">💰 Revenus</h2>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" required />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400 block mb-1">Libellé</label>
          <input type="text" value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} placeholder="ex: Virement client"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" required />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Montant (€)</label>
          <input type="number" step="0.01" min="0" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
            placeholder="0.00" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" required />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Catégorie</label>
          <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Pour qui</label>
          <select value={form.proprietaire} onChange={e => setForm(f => ({ ...f, proprietaire: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
            {PROPRIETAIRES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="text-xs text-slate-400 block mb-1">Notes</label>
          <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
        </div>
        <div className="md:col-span-1 flex items-end">
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50">
            {editId ? 'Modifier' : '+ Ajouter'}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <select value={mois} onChange={e => setMois(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm">
            {MOIS_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filtreProp} onChange={e => setFiltreProp(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm">
            <option value="tous">👥 Tous</option>
            {PROPRIETAIRES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <span className="text-green-400 font-bold">Total : {total.toFixed(2)} €</span>
      </div>

      {/* Mobile : cartes */}
      <div className="md:hidden space-y-3">
        {revenusFiltres.map(r => {
          const prop = getProprietaire(r.proprietaire ?? 'konan')
          return (
            <div key={r.id} className="bg-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium break-words">{r.libelle}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{r.date} · {r.categorie}</div>
                </div>
                <div className="text-green-400 font-bold whitespace-nowrap">{Number(r.montant).toFixed(2)} €</div>
              </div>
              <div><span className={`text-xs px-2 py-0.5 rounded border ${prop.color}`}>{prop.label}</span></div>
              {r.notes && <div className="text-xs text-slate-500 italic break-words">{r.notes}</div>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleEdit(r)} className="flex-1 text-white text-sm px-3 py-2 rounded-lg bg-slate-700 active:bg-slate-600">✏️ Modifier</button>
                <button onClick={() => handleDelete(r.id)} className="flex-1 text-white text-sm px-3 py-2 rounded-lg bg-red-600/80 active:bg-red-700">🗑️ Supprimer</button>
              </div>
            </div>
          )
        })}
        {revenusFiltres.length === 0 && (
          <div className="bg-slate-800 rounded-xl px-4 py-8 text-center text-slate-500">Aucun revenu pour ce mois</div>
        )}
      </div>

      {/* Desktop : tableau */}
      <div className="hidden md:block bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Date', 'Libellé', 'Catégorie', 'Montant', 'Pour', 'Notes', ''].map(h => (
                <th key={h} className="text-left text-xs text-slate-400 font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenusFiltres.map(r => {
              const prop = getProprietaire(r.proprietaire ?? 'konan')
              return (
                <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-300">{r.date}</td>
                  <td className="px-4 py-3 text-white font-medium">{r.libelle}</td>
                  <td className="px-4 py-3 text-slate-300">{r.categorie}</td>
                  <td className="px-4 py-3 text-green-400 font-semibold">{Number(r.montant).toFixed(2)} €</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${prop.color}`}>{prop.label}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{r.notes}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(r)} className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded border border-slate-600 hover:border-slate-400 transition-colors">✏️</button>
                    <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded border border-slate-600 hover:border-red-500 transition-colors">🗑️</button>
                  </td>
                </tr>
              )
            })}
            {revenusFiltres.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucun revenu pour ce mois</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
