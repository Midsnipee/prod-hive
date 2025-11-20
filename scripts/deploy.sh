#!/bin/bash

# Script de déploiement automatique pour synchroniser les migrations Supabase
# Usage: ./scripts/deploy.sh [environment]
# Environnements: local, staging, production

set -e

ENVIRONMENT=${1:-local}

echo "🚀 Déploiement de l'application - Environnement: $ENVIRONMENT"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v supabase &> /dev/null; then
    error "Supabase CLI n'est pas installé. Installez-le avec: npm install -g supabase"
fi

if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
fi

info "Prérequis OK"
echo ""

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install
info "Dépendances installées"
echo ""

# Vérification des migrations
echo "🔍 Vérification des migrations Supabase..."

MIGRATION_COUNT=$(find supabase/migrations -name "*.sql" 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -eq 0 ]; then
    warning "Aucune migration trouvée dans supabase/migrations/"
else
    info "$MIGRATION_COUNT migration(s) trouvée(s)"
fi
echo ""

# Déploiement selon l'environnement
case $ENVIRONMENT in
    local)
        echo "🏠 Déploiement en local..."
        
        # Démarrage de Supabase local
        echo "Démarrage de Supabase local..."
        supabase start
        
        # Vérification du statut
        supabase status
        
        info "Environnement local prêt"
        echo ""
        echo "🔗 URLs d'accès:"
        echo "   Studio: http://localhost:54323"
        echo "   API: http://localhost:54321"
        echo ""
        echo "👤 Pour créer les utilisateurs démo, l'application les créera automatiquement au premier lancement"
        ;;
        
    staging|production)
        echo "☁️  Déploiement sur $ENVIRONMENT..."
        
        # Vérification de la liaison Supabase
        if [ ! -f "supabase/.temp/project-ref" ]; then
            error "Projet Supabase non lié. Exécutez d'abord: supabase link --project-ref YOUR_PROJECT_REF"
        fi
        
        # Push des migrations
        echo "Application des migrations..."
        supabase db push
        
        # Déploiement des edge functions
        if [ -d "supabase/functions" ]; then
            echo "Déploiement des edge functions..."
            supabase functions deploy
        fi
        
        info "Déploiement sur $ENVIRONMENT terminé"
        ;;
        
    *)
        error "Environnement invalide. Utilisez: local, staging ou production"
        ;;
esac

echo ""
echo "✨ Déploiement terminé avec succès!"
