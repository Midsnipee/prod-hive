# Scripts utiles

Ce dossier contient des scripts pour faciliter la gestion du projet.

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
