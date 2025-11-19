#!/bin/bash

# Script pour réinitialiser complètement la base de données
# Usage: ./scripts/reset-database.sh [local|remote]

set -e

MODE=${1:-local}

echo "🗑️  Réinitialisation de la base de données en mode: $MODE"
echo ""

if [ "$MODE" = "local" ]; then
    echo "📦 Arrêt de Supabase local..."
    supabase stop || true
    
    echo "🚀 Démarrage de Supabase local..."
    supabase start
    
    echo "✅ Base de données locale réinitialisée avec succès!"
    echo ""
    echo "🔗 URLs d'accès:"
    echo "   Studio: http://localhost:54323"
    echo "   API: http://localhost:54321"
    echo "   DB: postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    echo "👤 Utilisateurs créés:"
    echo "   admin@stock.local / admin123"
    echo "   magasinier@stock.local / mag123"
    echo "   acheteur@stock.local / ach123"
    echo "   lecteur@stock.local / lec123"
    
elif [ "$MODE" = "remote" ]; then
    echo "⚠️  ATTENTION: Vous êtes sur le point de réinitialiser la base de données distante!"
    echo "   Toutes les données seront supprimées."
    echo ""
    read -p "   Êtes-vous sûr? (tapez 'oui' pour confirmer): " confirmation
    
    if [ "$confirmation" != "oui" ]; then
        echo "❌ Opération annulée"
        exit 1
    fi
    
    echo "🔄 Réinitialisation de la base distante..."
    supabase db reset --linked
    
    echo "👥 Création des utilisateurs démo..."
    supabase functions invoke seed-demo-users
    
    echo "✅ Base de données distante réinitialisée avec succès!"
    
else
    echo "❌ Mode invalide. Utilisation: $0 [local|remote]"
    exit 1
fi

echo ""
echo "✨ Terminé!"
