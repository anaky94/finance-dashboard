export const CATEGORIES = [
  { id: 'alimentation', label: '🛒 Alimentation', budget: 0 },
  { id: 'restauration', label: '🍗 Restauration', budget: 50 },
  { id: 'shopping', label: '🛍️ Shopping', budget: 100 },
  { id: 'loisirs', label: '🎮 Loisirs', budget: 100 },
  { id: 'bourse', label: '🏦 Virement BOURSE', budget: 200 },
  { id: 'transport', label: '🚗 Transport', budget: 100 },
  { id: 'abonnements', label: '📱 Abonnements', budget: 150 },
  { id: 'logement', label: '🏠 Logement', budget: 1135 },
  { id: 'sante', label: '💊 Santé', budget: 0 },
  { id: 'autre', label: '📦 Autre', budget: 200 },
]

const RULES = [
  { keywords: ['kfc', 'mcdo', 'burger', 'restaurant', 'michael james', 'brasserie', 'bistro'], cat: 'restauration' },
  { keywords: ['carrefour', 'leclerc', 'lidl', 'aldi', 'intermarché', 'casino', 'supermarché', 'monoprix'], cat: 'alimentation' },
  { keywords: ['amazon', 'action', 'zara', 'h&m', 'nathan store', 'fnac', 'decathlon'], cat: 'shopping' },
  { keywords: ['netflix', 'spotify', 'max jeune', 'sfr', 'orange', 'bouygues', 'abonnement', 'free'], cat: 'abonnements' },
  { keywords: ['péage', 'sncf', 'autoroute', 'parking', 'essence', 'total'], cat: 'transport' },
  { keywords: ['loyer', 'edf', 'eau', 'gaz', 'cotisation sainte famille', 'logement'], cat: 'logement' },
  { keywords: ['pharmacie', 'médecin', 'docteur', 'clinique', 'mutuelle'], cat: 'sante' },
  { keywords: ['virement bourse', 'pea', 'boursorama', 'trade republic', 'investing'], cat: 'bourse' },
  { keywords: ['prélèvement à la source', 'impôts', 'cotisation'], cat: 'autre' },
]

export function guessCategory(libelle) {
  const lower = libelle.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.cat
  }
  return 'autre'
}

export function getCategoryLabel(id) {
  return CATEGORIES.find(c => c.id === id)?.label ?? id
}
