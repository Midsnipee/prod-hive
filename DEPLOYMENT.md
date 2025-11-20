# Guide de Déploiement

Ce document explique comment déployer l'application depuis le repository GitHub.

> 🆕 **Débutant?** Consultez d'abord le [Guide de Démarrage Rapide](docs/QUICKSTART.md) avec des instructions visuelles étape par étape!

## 📋 Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installé globalement
- Git installé
- Un compte Supabase (pour les déploiements cloud)

### Installation de Supabase CLI

```bash
npm install -g supabase
```

## 🚀 Déploiement Rapide

### 1. Cloner le Repository

```bash
git clone <votre-repo-url>
cd <nom-du-projet>
```

### 2. Installation des Dépendances

```bash
npm install
```

### 3. Choisir votre Environnement de Déploiement

#### Option A: Développement Local (Recommandé pour débuter)

**Important**: Le script doit être exécuté depuis un terminal, pas en double-cliquant dessus.

```bash
# 1. Rendre le script exécutable (une seule fois)
chmod +x scripts/deploy.sh

# 2. Exécuter le script depuis le terminal
./scripts/deploy.sh local
```

**Sur Windows**: Utilisez Git Bash ou WSL (Windows Subsystem for Linux) pour exécuter les scripts bash.

Ou manuellement:

```bash
# Démarrer Supabase local
supabase start

# L'application créera automatiquement les utilisateurs démo au premier lancement
npm run dev
```

Accès:
- Application: http://localhost:5173
- Supabase Studio: http://localhost:54323
- API Supabase: http://localhost:54321

#### Option B: Déploiement Cloud (Staging/Production)

```bash
# 1. Lier votre projet Supabase
supabase link --project-ref YOUR_PROJECT_REF

# 2. Appliquer les migrations
supabase db push

# 3. Déployer les edge functions
supabase functions deploy

# 4. Créer les utilisateurs démo (automatique au premier lancement)
```

Ou utiliser le script de déploiement depuis le terminal:

```bash
# 1. Rendre le script exécutable (une seule fois)
chmod +x scripts/deploy.sh

# 2. Exécuter le script
./scripts/deploy.sh production
```

## 🔧 Configuration

### Variables d'Environnement

Le fichier `.env` est généré automatiquement par Lovable Cloud. Pour un déploiement externe, créez un fichier `.env` avec:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Récupérer les Credentials Supabase

```bash
# Pour un projet local
supabase status

# Pour un projet cloud
# Voir dans Settings > API de votre projet Supabase
```

## 📊 Structure de la Base de Données

### Migrations

Toutes les migrations sont versionnées dans `supabase/migrations/`. Elles sont appliquées automatiquement lors du déploiement.

Pour vérifier l'intégrité des migrations:

```bash
chmod +x scripts/verify-migrations.sh
./scripts/verify-migrations.sh
```

### Données de Démonstration

Les utilisateurs de démonstration sont créés automatiquement par l'edge function `seed-demo-users` au premier lancement de l'application.

Utilisateurs créés:
- **admin@stock.local** / admin123 (Administrateur)
- **magasinier@stock.local** / mag123 (Magasinier)
- **acheteur@stock.local** / ach123 (Acheteur)
- **lecteur@stock.local** / lec123 (Lecteur)

## 🔄 Synchronisation GitHub

### Synchronisation Automatique avec Lovable

Si vous utilisez Lovable:
- Les changements dans Lovable sont automatiquement poussés vers GitHub
- Les changements dans GitHub sont automatiquement synchronisés vers Lovable
- Aucune action manuelle requise

### Développement en Parallèle

Vous pouvez développer en utilisant:
1. **Lovable** pour le développement visuel et rapide
2. **Votre IDE local** pour les modifications avancées

Workflow recommandé:
```bash
# 1. Cloner le repo
git clone <votre-repo-url>

# 2. Créer une branche pour vos modifications
git checkout -b feature/ma-fonctionnalite

# 3. Faire vos modifications localement
# ... éditer les fichiers ...

# 4. Commiter et pousser
git add .
git commit -m "Ajout de ma fonctionnalité"
git push origin feature/ma-fonctionnalite

# 5. Créer une Pull Request sur GitHub
# 6. Merger vers main → synchronisation automatique avec Lovable
```

## 🧪 Tests et Vérifications

### Vérifier les Migrations

```bash
./scripts/verify-migrations.sh
```

### Vérifier la Connexion à la Base de Données

```bash
# Local
supabase db ping

# Cloud
psql "postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres" -c "SELECT version();"
```

### Statut des Migrations

```bash
supabase migration list
```

## 🆘 Dépannage

### Problème: "Supabase CLI not found"

```bash
npm install -g supabase
```

### Problème: "Project not linked"

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Trouvez votre `project-ref` dans l'URL de votre projet Supabase:
`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### Problème: "Migration already applied"

```bash
# Réinitialiser la base (⚠️ ATTENTION: Supprime toutes les données)
supabase db reset
```

### Problème: Les utilisateurs démo ne sont pas créés

Les utilisateurs sont créés automatiquement au premier lancement. Si ce n'est pas le cas:

```bash
# Vérifier les logs de l'edge function
supabase functions logs seed-demo-users

# Invoquer manuellement (nécessite un compte Supabase lié)
supabase functions invoke seed-demo-users
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Lovable](https://docs.lovable.dev)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## 🔐 Sécurité

### Configuration de la Sécurité (Production)

1. **Activer la protection des mots de passe divulgués**:
   - Aller dans Authentication > Settings dans votre dashboard Supabase
   - Activer "Password Breach Detection"

2. **Configurer les politiques RLS**:
   - Toutes les tables ont déjà des politiques RLS configurées
   - Vérifier avec: `supabase db linter`

3. **Variables d'environnement**:
   - Ne jamais commiter le fichier `.env`
   - Utiliser des secrets pour les déploiements cloud

## 🎯 Checklist de Déploiement

- [ ] Repository cloné
- [ ] Dépendances installées (`npm install`)
- [ ] Supabase CLI installé
- [ ] Projet Supabase lié (si cloud)
- [ ] Migrations vérifiées (`./scripts/verify-migrations.sh`)
- [ ] Migrations appliquées (`supabase db push` ou `./scripts/deploy.sh`)
- [ ] Edge functions déployées
- [ ] Utilisateurs démo créés (automatique)
- [ ] Variables d'environnement configurées
- [ ] Tests de connexion effectués
- [ ] Configuration de sécurité vérifiée

## 📞 Support

Pour toute question ou problème:
1. Vérifier la documentation ci-dessus
2. Consulter les logs: `supabase functions logs`
3. Vérifier les migrations: `./scripts/verify-migrations.sh`
