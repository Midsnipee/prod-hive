# 📋 Consignes du Projet ProdHive

## 🎯 Vue d'ensemble

ProdHive est une application de gestion de stock et d'inventaire IT construite avec:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Lovable Cloud)
- **Déploiement**: Docker + Nginx

---

## 🏗️ Architecture

### Structure des dossiers
```
prod-hive/
├── src/
│   ├── components/       # Composants React réutilisables
│   │   ├── ui/          # Composants shadcn/ui
│   │   ├── dashboard/   # Composants du tableau de bord
│   │   ├── forms/       # Formulaires
│   │   ├── layout/      # Layout (Header, Sidebar, AppLayout)
│   │   ├── orders/      # Composants liés aux commandes
│   │   └── settings/    # Composants de paramètres
│   ├── contexts/        # Contextes React (Auth)
│   ├── hooks/           # Hooks personnalisés
│   ├── integrations/    # Intégrations (Supabase)
│   ├── lib/             # Utilitaires
│   ├── pages/           # Pages de l'application
│   └── assets/          # Assets statiques
├── supabase/
│   ├── functions/       # Edge Functions
│   └── migrations/      # Migrations SQL
├── scripts/             # Scripts de déploiement
├── docs/                # Documentation
└── public/              # Fichiers publics
```

---

## 🔐 Authentification & Rôles

### Rôles disponibles
| Rôle | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrateur | Accès complet |
| `magasinier` | Gestionnaire de stock | Gestion des matériels et stocks |
| `acheteur` | Acheteur | Gestion des commandes |
| `lecteur` | Lecture seule | Consultation uniquement |

### Règles d'accès
- Les rôles sont stockés dans la table `user_roles`
- Les politiques RLS protègent toutes les données
- L'authentification utilise Supabase Auth avec confirmation email auto

---

## 📊 Base de données

### Tables principales
- `materials` - Catalogue des matériels
- `serials` - Numéros de série individuels
- `orders` - Commandes fournisseurs
- `order_lines` - Lignes de commande
- `order_files` - Fichiers attachés aux commandes
- `assignments` - Attributions de matériel
- `assignment_documents` - Documents d'attribution
- `suppliers` - Fournisseurs
- `profiles` - Profils utilisateurs
- `user_roles` - Rôles des utilisateurs

### Énumérations
- `material_category`: PC Portable, Fixe, Écran, Clavier, Souris, Casque, Webcam, Autre
- `serial_status`: En stock, Attribué, En réparation, Retiré, Télétravail
- `order_status`: Demandé, Circuit interne, Commande fournisseur faite, Livré
- `app_role`: admin, magasinier, acheteur, lecteur

---

## 🎨 Design System

### Principes
- Utiliser les tokens sémantiques de Tailwind (jamais de couleurs directes)
- Toutes les couleurs en HSL
- Design responsive obligatoire
- Mode sombre/clair supporté

### Variables CSS à utiliser
```css
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
```

### Composants UI
- Utiliser shadcn/ui comme base
- Personnaliser les variantes si nécessaire
- Garder la cohérence visuelle

---

## 🚀 Déploiement

### Docker (Recommandé)
```bash
# Production
docker-compose up -d

# Développement
docker-compose --profile dev up
```

### Scripts manuels
```bash
# Avec Git Bash sur Windows
./scripts/deploy.sh production
./scripts/deploy.sh local
```

### Environnements
| Environnement | URL | Description |
|---------------|-----|-------------|
| Local | http://localhost:5173 | Développement |
| Docker Local | http://localhost:80 | Test Docker |
| Production | Configurable | Production |

---

## 📁 Fichiers à ne JAMAIS modifier manuellement

Ces fichiers sont auto-générés:
- `src/integrations/supabase/types.ts`
- `src/integrations/supabase/client.ts`
- `.env`
- `supabase/config.toml`
- `package.json` (utiliser les outils dédiés)

---

## 🔧 Conventions de code

### TypeScript
- Typage strict obligatoire
- Interfaces pour les props de composants
- Types Supabase depuis `@/integrations/supabase/types`

### React
- Composants fonctionnels uniquement
- Hooks pour la logique réutilisable
- Contextes pour l'état global

### Imports
```typescript
// Ordre des imports
import { ... } from "react";           // React
import { ... } from "@/components/ui"; // UI Components
import { ... } from "@/hooks";         // Hooks
import { ... } from "@/lib";           // Utilitaires
import { ... } from "@/integrations";  // Intégrations
```

### Alias de chemins
```typescript
@/ = src/
```

---

## 🧪 Edge Functions

### Structure
```
supabase/functions/
├── _shared/           # Code partagé (CORS, etc.)
├── function-name/
│   └── index.ts      # Point d'entrée
```

### CORS obligatoire
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Secrets
- Jamais de clés API dans le code
- Utiliser les secrets Supabase
- Variables d'environnement pour la config

---

## 📝 Documentation requise

Chaque fonctionnalité majeure doit avoir:
1. Documentation dans `/docs`
2. Commentaires dans le code pour la logique complexe
3. README mis à jour si nécessaire

---

## 🔄 Workflow de développement

1. **Planifier** - Définir clairement les changements
2. **Implémenter** - Faire les modifications minimales nécessaires
3. **Tester** - Vérifier le fonctionnement
4. **Documenter** - Mettre à jour la doc si nécessaire

### Règles importantes
- ✅ Faire le minimum de changements nécessaires
- ✅ Refactoriser si le code devient complexe
- ✅ Créer des composants/hooks réutilisables
- ✅ Utiliser le design system
- ❌ Ne pas ajouter de fonctionnalités non demandées
- ❌ Ne pas modifier la logique métier pour des changements UI
- ❌ Ne pas créer de fichiers trop longs

---

## 🐳 Configuration Docker

### Dockerfile
- Build multi-stage (Node → Nginx)
- Image légère alpine
- Configuration Nginx optimisée

### docker-compose.yml
- Service principal: `prodhive`
- Profil dev disponible
- Healthcheck configuré

---

## 📚 Ressources

- [Guide de démarrage rapide](./QUICKSTART.md)
- [Guide Docker](./DOCKER.md)
- [Configuration Admin](./ADMIN_SETUP.md)
- [Documentation Déploiement](../DEPLOYMENT.md)

---

## ✅ Checklist avant commit

- [ ] Code TypeScript sans erreurs
- [ ] Design responsive vérifié
- [ ] Tokens sémantiques utilisés (pas de couleurs directes)
- [ ] Documentation mise à jour si nécessaire
- [ ] Pas de secrets dans le code
- [ ] Tests manuels effectués
