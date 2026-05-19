export const DOMAIN_COLORS = {
  business:      { color: '#FF6B35', light: '#FFF0EB' },
  sport:         { color: '#00C896', light: '#E6FAF5' },
  apprentissage: { color: '#6C63FF', light: '#F0EEFF' },
  finance:       { color: '#F5A623', light: '#FFF8EC' },
  marque:        { color: '#E91E8C', light: '#FDE9F4' },
  mindstyle:     { color: '#8B5CF6', light: '#F2EEFF' },
  relations:     { color: '#10B981', light: '#E8FBF5' },
  spiritualite:  { color: '#C2A06E', light: '#FBF6EE' },
  creativite:    { color: '#EC4899', light: '#FDF2F8' },
  famille:       { color: '#F97316', light: '#FFF7ED' },
  voyage:        { color: '#06B6D4', light: '#ECFEFF' },
  impact:        { color: '#7C3AED', light: '#F5F3FF' },
  sante_mentale: { color: '#14B8A6', light: '#F0FDFA' },
  reseau:        { color: '#64748B', light: '#F8FAFC' },
  etudes:        { color: '#3B82F6', light: '#EFF6FF' },
}

export const DOMAINS = [
  { id: 'business',      label: 'Business & Carrière', icon: '💼' },
  { id: 'sport',         label: 'Sport & Santé',        icon: '⚡' },
  { id: 'apprentissage', label: 'Apprentissage',         icon: '📚' },
  { id: 'finance',       label: 'Finance',               icon: '📈' },
  { id: 'marque',        label: 'Marque Perso',          icon: '🎯' },
  { id: 'mindstyle',     label: 'Mind & Life',           icon: '🌱' },
  { id: 'relations',     label: 'Relations',             icon: '🤝' },
  { id: 'spiritualite',  label: 'Spiritualité',          icon: '🤲' },
  { id: 'creativite',    label: 'Créativité',            icon: '🎨' },
  { id: 'famille',       label: 'Famille',               icon: '👨‍👩‍👧' },
  { id: 'voyage',        label: 'Voyage & Aventure',     icon: '🌍' },
  { id: 'impact',        label: 'Impact & Legacy',       icon: '📡' },
  { id: 'sante_mentale', label: 'Santé Mentale',         icon: '🧬' },
  { id: 'reseau',        label: 'Réseau',                icon: '🌐' },
  { id: 'etudes',        label: 'Études',                icon: '🎓' },
]

export const FORTUNE_ACTIF_CATEGORIES = [
  '💵 Cash & Liquidités',
  '🏦 Épargne & Comptes',
  '📈 Actions & Titres',
  '🏠 Immobilier',
  '🚗 Mobilier & Véhicules',
  '💼 Entreprises & Parts',
  '🪙 Crypto & Or',
  '🤝 Créances & Prêts accordés',
  '📦 Autres actifs',
]

export const FORTUNE_PASSIF_CATEGORIES = [
  '🏦 Crédits & Prêts',
  '💳 Dettes courantes',
  '📋 Autres passifs',
]

export const FLUX_REVENU_CATEGORIES = [
  '💼 Salaire & Activité principale',
  '🏪 Revenus business',
  '🏠 Revenus locatifs',
  '📈 Dividendes & Intérêts',
  '🎯 Freelance & Autres',
]

export const FLUX_DEPENSE_CATEGORIES = [
  '🏠 Logement & Charges',
  '🍽️ Alimentation',
  '🚗 Transport',
  '📱 Abonnements & Tech',
  '👗 Personnel & Loisirs',
  '💼 Business & Investissement',
  '💰 Épargne & Placement',
  '📋 Autres',
]

export const SEED_FORTUNE_ACTIFS = [
  { nom: 'Compte courant CIH',       categorie: '💵 Cash & Liquidités',  valeur: 8500  },
  { nom: 'Parts Black Version Parfums', categorie: '💼 Entreprises & Parts', valeur: 45000 },
  { nom: 'Parts OctoPub',            categorie: '💼 Entreprises & Parts', valeur: 30000 },
  { nom: 'Voiture',                  categorie: '🚗 Mobilier & Véhicules', valeur: 12000 },
]

export const SEED_FORTUNE_PASSIFS = [
  { nom: 'Crédit téléphone', categorie: '💳 Dettes courantes', valeur: 2400 },
]

export const HORIZONS = ['90_jours', '6_mois', '1_an', '3_ans']
export const HORIZON_LABEL = {
  '90_jours': '90 jours',
  '6_mois':   '6 mois',
  '1_an':     '1 an',
  '3_ans':    '3 ans',
}
export const FREQUENCE_LABEL = {
  'quotidien':    'Quotidien',
  'hebdomadaire': 'Hebdomadaire',
  '3x_semaine':   '3x / semaine',
  '5x_semaine':   '5x / semaine',
}
export const STATUTS = ['En cours', 'Atteint', 'Suspendu']
export const STATUT_TO_DB   = { 'En cours': 'actif', 'Atteint': 'atteint', 'Suspendu': 'suspendu' }
export const STATUT_FROM_DB = { 'actif': 'En cours', 'atteint': 'Atteint', 'suspendu': 'Suspendu' }

export const METEO_OPTIONS = [
  { emoji: '😴', label: 'Fatigué' },
  { emoji: '😐', label: 'Neutre' },
  { emoji: '🙂', label: 'Bien' },
  { emoji: '💪', label: 'Motivé' },
  { emoji: '🔥', label: 'En feu' },
]

export const PHRASES_MOTIVATIONNELLES = [
  "Chaque grand voyage commence par un premier pas.",
  "La discipline est le pont entre les objectifs et les accomplissements.",
  "Travaille en silence, laisse le succès faire du bruit.",
  "Ne comptez pas les jours, faites que les jours comptent.",
  "Le succès, c'est tomber sept fois et se relever huit.",
  "Votre seule limite, c'est vous-même.",
  "Les rêves ne fonctionnent que si vous travaillez.",
  "Soyez la version la plus difficile de vous-même.",
  "Chaque effort que tu fais aujourd'hui façonne qui tu seras demain.",
  "La réussite est la somme de petits efforts répétés chaque jour.",
  "Ne cherche pas à être le meilleur, cherche à être meilleur qu'hier.",
  "L'action est le fondement de tout succès.",
  "Les grandes choses se passent pour ceux qui n'arrêtent pas.",
  "Transforme tes blessures en sagesse.",
  "La persévérance est la clé qui ouvre toutes les portes.",
  "Construis chaque jour comme si c'était le fondement de ton futur.",
  "L'ambition sans action reste un rêve.",
  "Ta productivité d'aujourd'hui détermine ta liberté de demain.",
  "Fais de chaque jour une œuvre d'art.",
  "L'excellence n'est pas un acte, c'est une habitude.",
  "Les habitudes font les champions.",
  "Pense grand, agis petit, commence maintenant.",
  "Chaque non te rapproche d'un oui.",
  "La rigueur est la mère du talent.",
  "Qui maîtrise son temps maîtrise sa vie.",
  "Un objectif sans plan est juste un souhait.",
  "La croissance commence là où ta zone de confort se termine.",
  "Fais confiance au processus, les résultats suivront.",
  "Tu es capable de bien plus que tu ne le crois.",
  "Commence. Le reste vient en chemin.",
]

export const SEED_DATA = {
  objectifs: [
    {
      domaine: 'business',
      titre: 'Ouvrir la 2e boutique Black Version',
      description: 'Expansion physique avec un nouveau point de vente',
      kpi: 'CA > 80 000 MAD/mois',
      horizon: '1 an',
      status: 'En cours',
      progress: 25,
      milestones: [
        { id: '1', texte: 'Trouver le local commercial', done: true },
        { id: '2', texte: 'Négocier le bail', done: false },
        { id: '3', texte: 'Aménagement et stock', done: false },
      ],
    },
    {
      domaine: 'business',
      titre: 'Systématiser OctoPub avec 3 commerciaux',
      description: 'Constituer une équipe de vente indépendante',
      kpi: '30 clients B2B actifs',
      horizon: '6 mois',
      status: 'En cours',
      progress: 15,
      milestones: [
        { id: '1', texte: 'Créer le script de vente', done: true },
        { id: '2', texte: 'Recruter 3 commerciaux', done: false },
      ],
    },
    {
      domaine: 'marque',
      titre: 'Atteindre 5K abonnés Instagram',
      description: 'Développer ma présence sur les réseaux sociaux',
      kpi: '5 000 followers',
      horizon: '6 mois',
      status: 'En cours',
      progress: 20,
      milestones: [],
    },
    {
      domaine: 'sport',
      titre: 'Courir 5km sans s\'arrêter',
      description: 'Construire une base cardio solide',
      kpi: '5km en moins de 30min',
      horizon: '90 jours',
      status: 'En cours',
      progress: 40,
      milestones: [
        { id: '1', texte: 'Courir 2km sans pause', done: true },
        { id: '2', texte: 'Courir 3km sans pause', done: false },
        { id: '3', texte: 'Courir 5km sans pause', done: false },
      ],
    },
    {
      domaine: 'finance',
      titre: 'Épargner 20% des revenus chaque mois',
      description: 'Construire un coussin financier solide',
      kpi: 'Taux d\'épargne ≥ 20%',
      horizon: '1 an',
      status: 'En cours',
      progress: 55,
      milestones: [],
    },
  ],
  habitudes: [
    { titre: 'Lecture 30 min',           icon: '📖', domaine: 'apprentissage', frequence: 'Quotidien',    actif: true },
    { titre: 'Sport / Cardio',            icon: '🏃', domaine: 'sport',         frequence: 'Quotidien',    actif: true },
    { titre: 'Revue objectifs',           icon: '🎯', domaine: 'mindstyle',     frequence: 'Quotidien',    actif: true },
    { titre: 'Pas de réseaux avant 10h',  icon: '📵', domaine: 'mindstyle',     frequence: 'Quotidien',    actif: true },
    { titre: 'Contenu Instagram',         icon: '🎯', domaine: 'marque',        frequence: '3x/semaine',   actif: true },
    { titre: "Prier Fajr à l'heure",     icon: '🙏', domaine: 'spiritualite',  frequence: 'Quotidien',    actif: true },
    { titre: 'Lire le Coran 15 min',      icon: '📖', domaine: 'spiritualite',  frequence: 'Quotidien',    actif: true },
    { titre: 'Se lever à 6h',             icon: '⏰', domaine: 'mindstyle',     frequence: 'Quotidien',    actif: true },
    { titre: 'Cardio 30 min',             icon: '🏃', domaine: 'sport',         frequence: '5x/semaine',   actif: true },
  ],
  rituel: [
    { nom: 'Hydratation + vitamines',   duree_min: 2 },
    { nom: 'Journal 5 minutes',          duree_min: 5 },
    { nom: 'Revue objectifs du jour',    duree_min: 5 },
    { nom: 'Plan du jour (3 priorités)', duree_min: 5 },
    { nom: 'Lecture',                    duree_min: 20 },
  ],
}
