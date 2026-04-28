import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, guessCategory, getCategoryLabel } from '../lib/categories'

const MODES = ['💳 Carte bleue', '🏦 Virement', '📱 Sans contact', '💵 Espèces']
const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const today = () => new Date().toISOString().split('T')[0]
const curMois = () => new Date().getMonth() + 1
const curAnnee = () => new Date().getFullYear()

export default function Depenses() {
  const [mois, setMois] = useState(curMois())
  const [annee, setAnnee] = useState(curAnnee())
  const [depenses, setDepenses] = useState([])
  const [form, setForm] = useState({ date: today(), libelle: '', categorie: 'autre', montant: '', mode: '💳 Carte bleue', notes: '' })
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('depenses').select('*').eq('mois', mois).eq('annee', annee).order('date', { ascending: false })
    setDepenses(data ?? [])
  }

  useEffect(() => { load() }, [mois, annee])

  const handleLibelleChange = (val) => {
    const cat = guessCategory(val)
    setForm(f => ({ ...f, libelle: val, categorie: cat }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const d = new Date(form.date)
    const row = { ...form, montant: parseFloat(form.montant), mois: d.getMonth() + 1, annee: d.getFullYear() }
    let result
    if (editId) {
      result = await supabase.from('depenses').update(row).eq('id', editId)
      setEditId(null)
    } else {
      result = await supabase.from('depenses').insert([row])
    }
    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }
    setForm({ date: today(), libelle: '', categorie: 'autre', montant: '', mode: '💳 Carte bleue', notes: '' })
    setLoading(false)
    load()
  }

  const handleDelete = async (id) => {
    await supabase.from('depenses').delete().eq('id', id)
    load()
  }

  const handleEdit = (d) => {
    setEditId(d.id)
    setForm({ date: d.date, libelle: d.libelle, categorie: d.categorie, montant: String(d.montant), mode: d.mode, notes: d.notes ?? '' })
  }

  const total = depenses.reduce((s, d) => s + Number(d.montant), 0)

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <h2 className="text-2xl font-bold text-white">💸 Dépenses</h2>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">
          ❌ Erreur : {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Date</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" required />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400 block mb-1">Libellé</label>
          <input type="text" value={form.libelle} onChange={e => handleLibelleChange(e.target.value)} placeholder="ex: KFC Chambéry"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" required />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Catégorie</label>
          <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Montant (€)</label>
          <input type="number" step="0.01" min="0" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
            placeholder="0.00" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" required />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Mode</label>
          <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="md:col-span-5">
          <label className="text-xs text-slate-400 block mb-1">Notes (optionnel)</label>
          <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" />
        </div>
        <div className="md:col-span-1 flex items-end">
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50">
            {editId ? 'Modifier' : '+ Ajouter'}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <select value={mois} onChange={e => setMois(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm">
            {MOIS_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <span className="text-red-400 font-bold">Total : {total.toFixed(2)} €</span>
      </div>

      {/* Mobile : cartes */}
      <div className="md:hidden space-y-3">
        {depenses.map(d => (
          <div key={d.id} className="bg-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-white font-medium break-words">{d.libelle}</div>
                <div className="text-xs text-slate-400 mt-0.5">{d.date} · {getCategoryLabel(d.categorie)}</div>
              </div>
              <div className="text-red-400 font-bold whitespace-nowrap">{Number(d.montant).toFixed(2)} €</div>
            </div>
            <div className="text-xs text-slate-400">{d.mode}</div>
            {d.notes && <div className="text-xs text-slate-500 italic break-words">{d.notes}</div>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => handleEdit(d)} className="flex-1 text-white text-sm px-3 py-2 rounded-lg bg-slate-700 active:bg-slate-600">✏️ Modifier</button>
              <button onClick={() => handleDelete(d.id)} className="flex-1 text-white text-sm px-3 py-2 rounded-lg bg-red-600/80 active:bg-red-700">🗑️ Supprimer</button>
            </div>
          </div>
        ))}
        {depenses.length === 0 && (
          <div className="bg-slate-800 rounded-xl px-4 py-8 text-center text-slate-500">Aucune dépense pour ce mois</div>
        )}
      </div>

      {/* Desktop : tableau */}
      <div className="hidden md:block bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {['Date', 'Libellé', 'Catégorie', 'Montant', 'Mode', ''].map(h => (
                <th key={h} className="text-left text-xs text-slate-400 font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depenses.map(d => (
              <tr key={d.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 text-slate-300">{d.date}</td>
                <td className="px-4 py-3 text-white font-medium">{d.libelle}</td>
                <td className="px-4 py-3 text-slate-300">{getCategoryLabel(d.categorie)}</td>
                <td className="px-4 py-3 text-red-400 font-semibold">{Number(d.montant).toFixed(2)} €</td>
                <td className="px-4 py-3 text-slate-400">{d.mode}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(d)} className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded border border-slate-600 hover:border-slate-400 transition-colors">✏️</button>
                  <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-red-400 text-xs px-2 py-1 rounded border border-slate-600 hover:border-red-500 transition-colors">🗑️</button>
                </td>
              </tr>
            ))}
            {depenses.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucune dépense pour ce mois</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
