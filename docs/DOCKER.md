# Guide de Déploiement Docker

Ce guide explique comment déployer l'application dans un conteneur Docker.

## 📋 Prérequis

- Docker installé sur votre machine ([Télécharger Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (inclus avec Docker Desktop)
- Fichier `.env` configuré avec vos variables Supabase

## 🚀 Déploiement Rapide

### Option 1 : Docker Compose (Recommandé)

```bash
# 1. Créer le fichier .env si ce n'est pas déjà fait
cp .env.example .env

# 2. Éditer le .env avec vos variables Supabase
# VITE_SUPABASE_URL=https://votre-projet.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé
# VITE_SUPABASE_PROJECT_ID=votre-projet-id

# 3. Construire et démarrer l'application
docker-compose up -d

# L'application sera accessible sur http://localhost:3000
```

### Option 2 : Docker classique

```bash
# 1. Construire l'image
docker build -t prod-hive .

# 2. Lancer le conteneur
docker run -d \
  -p 3000:80 \
  -e VITE_SUPABASE_URL=https://votre-projet.supabase.co \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé \
  -e VITE_SUPABASE_PROJECT_ID=votre-projet-id \
  --name prod-hive \
  prod-hive
```

## 🛠️ Commandes Utiles

### Gestion du conteneur

```bash
# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Redémarrer l'application
docker-compose restart

# Reconstruire l'image après des modifications
docker-compose up -d --build

# Vérifier l'état du conteneur
docker-compose ps
```

### Nettoyage

```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer aussi les volumes (attention : perte de données)
docker-compose down -v

# Nettoyer les images inutilisées
docker image prune -a
```

## 🌐 Déploiement en Production

### Variables d'environnement

Pour la production, créez un fichier `.env.production` :

```env
VITE_SUPABASE_URL=https://votre-projet-production.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-clé-production
VITE_SUPABASE_PROJECT_ID=votre-projet-id-production
```

Puis lancez avec :

```bash
docker-compose --env-file .env.production up -d
```

### Configuration nginx personnalisée

Si vous avez besoin de personnaliser la configuration nginx, modifiez le fichier `nginx.conf` avant de construire l'image.

### Utilisation d'un reverse proxy

Pour utiliser avec Traefik, Nginx Proxy Manager, ou autre :

```yaml
version: '3.8'

services:
  app:
    build: .
    expose:
      - "80"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prod-hive.rule=Host(`votre-domaine.com`)"
      - "traefik.http.services.prod-hive.loadbalancer.server.port=80"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

## 📊 Health Check

L'application expose un endpoint de health check :

```bash
curl http://localhost:3000/health
# Retourne : healthy
```

Vous pouvez l'utiliser dans votre orchestrateur (Kubernetes, Docker Swarm, etc.).

## 🔧 Dépannage

### Le conteneur ne démarre pas

```bash
# Vérifier les logs
docker-compose logs app

# Vérifier les variables d'environnement
docker-compose exec app env | grep VITE
```

### L'application ne se connecte pas à Supabase

- Vérifiez que vos variables d'environnement sont correctes
- Vérifiez que le conteneur peut accéder à Internet
- Consultez les logs du navigateur (F12)

### Problèmes de construction

```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Nettoyer les images intermédiaires
docker builder prune
```

## 🚢 Déploiement sur un serveur

### Via SSH

```bash
# 1. Copier les fichiers sur le serveur
scp -r . user@serveur:/path/to/app

# 2. Se connecter au serveur
ssh user@serveur

# 3. Naviguer vers le dossier
cd /path/to/app

# 4. Lancer l'application
docker-compose up -d
```

### Via CI/CD (GitHub Actions)

Exemple de workflow `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t prod-hive .
      
      - name: Deploy to server
        run: |
          # Ajoutez vos commandes de déploiement ici
```

## 📦 Optimisations

L'image Docker utilise :
- **Multi-stage build** pour une image légère (~25MB)
- **Nginx Alpine** pour un serveur web performant
- **Compression gzip** activée
- **Cache des assets statiques** configuré
- **Headers de sécurité** ajoutés

## 🔗 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Guide Supabase](https://supabase.com/docs)
