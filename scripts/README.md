# Scripts utiles

Ce dossier contient des scripts pour faciliter la gestion du projet.

## deploy.sh

Script de déploiement automatique pour synchroniser et déployer l'application avec les migrations Supabase.

### Usage

```bash
# Déploiement local (par défaut)
./scripts/deploy.sh
./scripts/deploy.sh local

# Déploiement staging
./scripts/deploy.sh staging

# Déploiement production
./scripts/deploy.sh production
```

### Ce que fait le script

1. Vérifie les prérequis (Supabase CLI, Node.js)
2. Installe les dépendances npm
3. Vérifie les migrations disponibles
4. Selon l'environnement:
   - **Local**: Démarre Supabase local avec Docker
   - **Staging/Production**: Applique les migrations et déploie les edge functions

### Prérequis

- [Supabase CLI](https://supabase.com/docs/guides/cli) installé
- Docker installé (pour le mode local)
- Projet Supabase lié (pour staging/production)

## verify-migrations.sh

Script de vérification de l'intégrité des migrations Supabase.

### Usage

```bash
./scripts/verify-migrations.sh
```

### Vérifications effectuées

1. Existence du dossier `supabase/migrations/`
2. Format des noms de fichiers de migration (YYYYMMDDHHMMSS_description.sql)
3. Syntaxe SQL basique
4. Présence du fichier `seed.sql`
5. Statut des migrations (si Supabase CLI disponible)

## reset-database.sh

Réinitialise complètement la base de données (locale ou distante).

### Usage

```bash
# Réinitialiser la base de données locale (par défaut)
./scripts/reset-database.sh

# Ou explicitement
./scripts/reset-database.sh local

# Réinitialiser la base de données distante (Supabase Cloud)
./scripts/reset-database.sh remote
```

### Prérequis

- [Supabase CLI](https://supabase.com/docs/guides/cli) installé
- Docker installé (pour le mode local)
- Projet Supabase lié (pour le mode remote)

### Mode local

Le script va :
1. Arrêter l'environnement Supabase local
2. Redémarrer Supabase (ce qui applique toutes les migrations)
3. Les utilisateurs démo sont créés automatiquement par l'application

### Mode remote

⚠️ **ATTENTION** : Ce mode supprime TOUTES les données de votre base de données distante !

Le script va :
1. Demander confirmation
2. Réinitialiser la base de données distante
3. Appliquer toutes les migrations
4. Créer les utilisateurs démo via l'edge function

### Rendre le script exécutable

Si vous obtenez une erreur de permission, rendez le script exécutable :

```bash
chmod +x scripts/reset-database.sh
```

## Autres scripts

Vous pouvez ajouter d'autres scripts utiles ici pour :
- Backup de la base de données
- Import/export de données
- Tests automatisés
- Déploiement
