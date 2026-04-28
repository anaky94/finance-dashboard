export const PROPRIETAIRES = [
  { id: 'konan', label: '👨 Konan', color: 'bg-blue-600/30 text-blue-300 border-blue-500/40' },
  { id: 'femme', label: '👩 Femme', color: 'bg-pink-600/30 text-pink-300 border-pink-500/40' },
  { id: 'commun', label: '👫 Commun', color: 'bg-purple-600/30 text-purple-300 border-purple-500/40' },
]

export const getProprietaire = (id) => PROPRIETAIRES.find(p => p.id === id) ?? PROPRIETAIRES[0]
