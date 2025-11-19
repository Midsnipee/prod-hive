# Supabase Database Setup

Ce dossier contient toute la configuration nécessaire pour régénérer la base de données depuis GitHub.

## Structure

```
supabase/
├── migrations/          # Migrations SQL pour la structure de la base
├── functions/          # Edge Functions Supabase
├── seed.sql           # Données de démarrage (utilisateurs démo, etc.)
├── config.toml        # Configuration Supabase
└── README.md          # Ce fichier
```

## Régénération de la base de données

### Prérequis

- [Supabase CLI](https://supabase.com/docs/guides/cli) installé
- Docker installé (pour l'environnement local)
- Ou accès à un projet Supabase Cloud

### Option 1 : Développement local avec Supabase CLI

1. **Démarrer Supabase localement**
   ```bash
   supabase start
   ```
   Cette commande va :
   - Démarrer un environnement Supabase local avec Docker
   - Appliquer automatiquement toutes les migrations
   - Créer la structure complète de la base de données

2. **Appliquer les données de démarrage (seed)**
   ```bash
   supabase db seed
   ```
   Cela va exécuter le fichier `seed.sql` pour créer les utilisateurs démo.

3. **Accéder à la base**
   - Studio: http://localhost:54323
   - API URL: http://localhost:54321
   - DB URL: postgresql://postgres:postgres@localhost:54322/postgres

4. **Arrêter l'environnement**
   ```bash
   supabase stop
   ```

### Option 2 : Déploiement sur Supabase Cloud

1. **Lier votre projet**
   ```bash
   supabase link --project-ref <votre-project-ref>
   ```

2. **Pousser les migrations**
   ```bash
   supabase db push
   ```

3. **Créer les utilisateurs démo**
   
   Via l'application (recommandé pour Lovable Cloud) :
   - Les utilisateurs démo seront créés automatiquement au premier lancement de l'application
   - L'edge function `seed-demo-users` est appelée automatiquement
   
   Ou manuellement via CLI :
   ```bash
   supabase functions invoke seed-demo-users
   ```

### Option 3 : Reset complet d'une base existante

⚠️ **ATTENTION : Cela supprimera TOUTES les données**

```bash
supabase db reset
```

Cette commande va :
1. Supprimer toute la base de données
2. Recréer les tables depuis les migrations
3. Appliquer automatiquement `seed.sql`

## Migrations

Les migrations sont appliquées dans l'ordre chronologique (timestamp dans le nom du fichier).

### Créer une nouvelle migration

```bash
supabase migration new <nom-de-la-migration>
```

Exemple :
```bash
supabase migration new add_inventory_table
```

### Vérifier le statut des migrations

```bash
supabase migration list
```

## Edge Functions

Les edge functions sont dans le dossier `functions/`. Pour les déployer :

```bash
# Déployer toutes les fonctions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy seed-demo-users
```

## Utilisateurs démo

Les utilisateurs suivants sont créés automatiquement :

| Email | Mot de passe | Rôle | Département |
|-------|--------------|------|-------------|
| admin@stock.local | admin123 | Admin | IT |
| magasinier@stock.local | mag123 | Magasinier | Logistique |
| acheteur@stock.local | ach123 | Acheteur | Achats |
| lecteur@stock.local | lec123 | Lecteur | Commercial |

## Structure de la base de données

### Tables principales

- **profiles** : Profils utilisateurs (synchronisé avec auth.users)
- **user_roles** : Rôles des utilisateurs (admin, magasinier, acheteur, lecteur)
- **materials** : Catalogue des matériels
- **serials** : Numéros de série et suivi des matériels
- **assignments** : Attributions de matériel aux utilisateurs
- **orders** : Commandes fournisseurs
- **order_lines** : Lignes de commande
- **order_files** : Fichiers attachés aux commandes
- **suppliers** : Fournisseurs
- **assignment_documents** : Documents d'attribution

### Sécurité (RLS)

Row Level Security (RLS) est activé sur toutes les tables avec des politiques basées sur les rôles :
- **admin** : Accès complet
- **magasinier** : Gestion du stock et des attributions
- **acheteur** : Gestion des commandes
- **lecteur** : Lecture seule

## Backup et restauration

### Créer un backup

```bash
# Backup local
supabase db dump -f backup.sql

# Backup d'un projet cloud
supabase db dump --db-url <database-url> -f backup.sql
```

### Restaurer un backup

```bash
supabase db reset
psql postgresql://postgres:postgres@localhost:54322/postgres < backup.sql
```

## Ressources

- [Documentation Supabase CLI](https://supabase.com/docs/guides/cli)
- [Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentation du projet](../docs/ADMIN_SETUP.md)
