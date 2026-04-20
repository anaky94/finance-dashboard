-- Tables pour Finance Dashboard
-- À coller dans Supabase > SQL Editor

create table if not exists depenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  libelle text not null,
  categorie text not null,
  montant numeric(10,2) not null,
  mode text,
  notes text,
  mois int not null,
  annee int not null,
  created_at timestamptz default now()
);

create table if not exists revenus (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  libelle text not null,
  montant numeric(10,2) not null,
  categorie text,
  notes text,
  mois int not null,
  annee int not null,
  created_at timestamptz default now()
);

create table if not exists portefeuille (
  ticker text primary key,
  nom text not null,
  quantite int not null,
  cours_actuel numeric(10,2) not null,
  pru numeric(10,2) not null,
  updated_at timestamptz default now()
);

create table if not exists liquidites_pea (
  id int primary key default 1,
  montant numeric(10,2) not null default 0,
  updated_at timestamptz default now()
);

-- Désactiver RLS pour usage perso (ou activer avec policy si besoin)
alter table depenses disable row level security;
alter table revenus disable row level security;
alter table portefeuille disable row level security;
alter table liquidites_pea disable row level security;

-- Données initiales (migration depuis Excel)
insert into portefeuille (ticker, nom, quantite, cours_actuel, pru) values
  ('ADYEN', 'Adyen N.V.', 2, 858.80, 1257.30),
  ('AI', 'L''Air Liquide', 4, 188.54, 161.06),
  ('NRO', 'NEURONES', 5, 36.00, 36.68),
  ('ALSTI', 'STIF (ALXP)', 46, 49.12, 52.90),
  ('LU2798', 'Indep. Am Europe Mid A', 6, 139.58, 138.15)
on conflict (ticker) do nothing;

insert into liquidites_pea (id, montant) values (1, 466.58)
on conflict (id) do nothing;

-- Dépenses Avril 2026
insert into depenses (date, libelle, categorie, montant, mode, notes, mois, annee) values
  ('2026-04-04', 'Action', 'shopping', 27.96, '💳 Carte bleue', null, 4, 2026),
  ('2026-04-05', 'Jardin des plantes', 'loisirs', 44.95, '💳 Carte bleue', null, 4, 2026),
  ('2026-04-05', 'KFC Chambéry', 'restauration', 24.85, '💳 Carte bleue', null, 4, 2026),
  ('2026-04-09', 'Cotisation Sainte Famille', 'logement', 90.00, '🏦 Virement', null, 4, 2026),
  ('2026-04-10', 'Prélèvement Max Jeune', 'abonnements', 79.00, '🏦 Virement', 'Réf: inv3-04225384', 4, 2026),
  ('2026-04-11', 'Michael James - Restaurant', 'restauration', 14.50, '💳 Carte bleue', 'Chambéry', 4, 2026),
  ('2026-04-12', 'Péage autoroute', 'transport', 13.50, '💳 Carte bleue', null, 4, 2026),
  ('2026-04-13', 'Nathan Store - Chambéry', 'shopping', 7.79, '📱 Sans contact', null, 4, 2026),
  ('2026-04-15', 'Prélèvement à la source', 'autre', 48.00, '🏦 Virement', 'Impôts revenus 2026', 4, 2026);

-- Revenu Mars 2026
insert into revenus (date, libelle, montant, categorie, notes, mois, annee) values
  ('2026-03-31', 'VIRT KONAN ANAKY', 200.00, '💰 Virement reçu', 'Investissement espèces PEA', 3, 2026);
