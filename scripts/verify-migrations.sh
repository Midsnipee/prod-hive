#!/bin/bash

# Script de vérification de l'intégrité des migrations Supabase
# Usage: ./scripts/verify-migrations.sh

set -e

echo "🔍 Vérification de l'intégrité des migrations Supabase"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérification de l'existence du dossier migrations
if [ ! -d "supabase/migrations" ]; then
    error "Le dossier supabase/migrations n'existe pas"
    exit 1
fi

# Comptage des migrations
MIGRATION_COUNT=$(find supabase/migrations -name "*.sql" | wc -l)
echo "📊 Nombre de migrations: $MIGRATION_COUNT"
echo ""

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    warning "Aucune migration trouvée"
    exit 0
fi

# Vérification du format des noms de fichiers
echo "📝 Vérification du format des noms de fichiers..."
INVALID_FILES=0

for file in supabase/migrations/*.sql; do
    filename=$(basename "$file")
    
    # Les migrations doivent commencer par un timestamp (format: YYYYMMDDHHMMSS)
    if [[ ! $filename =~ ^[0-9]{14}_.+\.sql$ ]]; then
        error "Format de nom invalide: $filename"
        echo "   Format attendu: YYYYMMDDHHMMSS_description.sql"
        INVALID_FILES=$((INVALID_FILES + 1))
    fi
done

if [ "$INVALID_FILES" -eq 0 ]; then
    info "Tous les noms de fichiers sont valides"
else
    error "$INVALID_FILES fichier(s) avec un format de nom invalide"
    exit 1
fi

echo ""

# Vérification de la syntaxe SQL basique
echo "🔍 Vérification de la syntaxe SQL basique..."
SYNTAX_ERRORS=0

for file in supabase/migrations/*.sql; do
    filename=$(basename "$file")
    
    # Vérification de base: le fichier contient-il du SQL valide?
    if ! grep -qiE "(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|SELECT)" "$file"; then
        warning "Aucune commande SQL détectée dans: $filename"
        SYNTAX_ERRORS=$((SYNTAX_ERRORS + 1))
    fi
    
    # Vérification des points-virgules finaux
    if ! grep -q ";" "$file"; then
        warning "Aucun point-virgule trouvé dans: $filename"
        SYNTAX_ERRORS=$((SYNTAX_ERRORS + 1))
    fi
done

if [ "$SYNTAX_ERRORS" -eq 0 ]; then
    info "Syntaxe SQL de base valide pour toutes les migrations"
else
    warning "$SYNTAX_ERRORS migration(s) avec des problèmes potentiels de syntaxe"
fi

echo ""

# Vérification du fichier seed.sql
echo "🌱 Vérification du fichier seed.sql..."
if [ -f "supabase/seed.sql" ]; then
    info "Fichier seed.sql présent"
    
    # Vérification du contenu
    if grep -qiE "(INSERT|UPDATE)" "supabase/seed.sql"; then
        info "Le fichier seed.sql contient des données"
    else
        warning "Le fichier seed.sql ne semble pas contenir de données d'insertion"
    fi
else
    warning "Fichier seed.sql non trouvé (optionnel)"
fi

echo ""

# Statut des migrations (si Supabase CLI est disponible)
if command -v supabase &> /dev/null; then
    echo "📋 Statut des migrations Supabase..."
    
    # Vérification si le projet est lié
    if [ -f "supabase/.temp/project-ref" ] || [ -f ".git" ]; then
        supabase migration list 2>/dev/null || warning "Impossible de récupérer le statut des migrations"
    else
        warning "Projet Supabase non lié. Exécutez: supabase link"
    fi
else
    warning "Supabase CLI non installé. Installez-le pour vérifier le statut des migrations"
fi

echo ""
echo "✨ Vérification terminée"
