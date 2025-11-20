# 🚀 Guide de Démarrage Rapide

Ce guide est conçu pour les débutants qui n'ont jamais utilisé le terminal. Suivez ces étapes simples pour démarrer votre application.

## 📺 Vidéo Tutoriel

> **Note**: Une vidéo tutorielle sera bientôt disponible sur YouTube pour illustrer ces étapes.

## 🖥️ Étape 1: Ouvrir un Terminal

### Sur Windows

**Option 1: Git Bash (Recommandé)**
1. Téléchargez [Git for Windows](https://git-scm.com/download/win)
2. Installez Git avec les options par défaut
3. Clic droit dans le dossier de votre projet
4. Sélectionnez **"Git Bash Here"**

![Capture: Menu contextuel Windows avec "Git Bash Here"](../public/docs/windows-git-bash.png)

**Option 2: WSL (Windows Subsystem for Linux)**
1. Ouvrez le Menu Démarrer
2. Tapez `wsl` ou `ubuntu`
3. Appuyez sur Entrée

### Sur macOS

1. Ouvrez **Spotlight** (Cmd + Espace)
2. Tapez `terminal`
3. Appuyez sur Entrée

![Capture: Spotlight macOS avec recherche "terminal"](../public/docs/macos-terminal.png)

**Alternative**: 
- Allez dans **Applications > Utilitaires > Terminal**

### Sur Linux

1. Appuyez sur `Ctrl + Alt + T`

**Alternative**:
- Cherchez "Terminal" dans le menu des applications

## 📂 Étape 2: Naviguer vers le Projet

Une fois le terminal ouvert, vous devez aller dans le dossier de votre projet.

### Commande `cd` (Change Directory)

```bash
# Exemple: Si votre projet est dans Documents/mon-projet
cd Documents/mon-projet
```

### 💡 Astuce: Glisser-Déposer

**Sur macOS et Linux:**
1. Tapez `cd ` (avec un espace après)
2. Glissez le dossier du projet depuis le Finder/Explorateur vers le terminal
3. Appuyez sur Entrée

![Capture: Glisser-déposer un dossier dans le terminal](../public/docs/drag-drop-folder.png)

### Vérifier que vous êtes au bon endroit

Tapez cette commande pour voir les fichiers:

```bash
ls
```

Vous devriez voir des dossiers comme `src`, `supabase`, `scripts`, etc.

## ⚡ Étape 3: Rendre le Script Exécutable

Cette étape n'est nécessaire qu'**une seule fois**.

```bash
chmod +x scripts/deploy.sh
```

**Que fait cette commande?**
- `chmod` = Change Mode (changer les permissions)
- `+x` = Ajouter la permission d'exécution
- `scripts/deploy.sh` = Le fichier concerné

## 🎯 Étape 4: Lancer le Script

```bash
./scripts/deploy.sh local
```

**Explication:**
- `./` = "Dans le dossier actuel"
- `scripts/deploy.sh` = Le chemin vers le script
- `local` = L'environnement (local, staging, ou production)

## 📸 Captures d'Écran Complètes

### 🖼️ Processus Complet sur Windows

```
1. Clic droit dans le dossier du projet
   ┗━━ Sélectionner "Git Bash Here"

2. Terminal Git Bash s'ouvre
   ┗━━ Vous êtes déjà dans le bon dossier!

3. Taper: chmod +x scripts/deploy.sh
   ┗━━ Appuyer sur Entrée

4. Taper: ./scripts/deploy.sh local
   ┗━━ Appuyer sur Entrée

5. ✅ Le script s'exécute!
```

### 🖼️ Processus Complet sur macOS

```
1. Ouvrir Terminal (Cmd + Espace → "terminal")

2. Naviguer vers le projet:
   ┗━━ Taper: cd 
   ┗━━ Glisser le dossier du projet
   ┗━━ Appuyer sur Entrée

3. Taper: chmod +x scripts/deploy.sh
   ┗━━ Appuyer sur Entrée

4. Taper: ./scripts/deploy.sh local
   ┗━━ Appuyer sur Entrée

5. ✅ Le script s'exécute!
```

## ❓ Questions Fréquentes

### Q: Pourquoi le script s'ouvre dans VSCode quand je double-clique?

**R**: Les scripts `.sh` sont des fichiers texte, donc votre ordinateur les ouvre dans un éditeur. Il faut les **exécuter depuis le terminal** pour qu'ils fonctionnent.

### Q: J'ai l'erreur "command not found"

**R**: Vérifiez que vous êtes bien dans le dossier du projet:
```bash
# Afficher le chemin actuel
pwd

# Lister les fichiers
ls

# Si vous ne voyez pas le dossier "scripts", vous n'êtes pas au bon endroit
```

### Q: J'ai l'erreur "Permission denied"

**R**: Vous avez oublié l'étape 3. Exécutez:
```bash
chmod +x scripts/deploy.sh
```

### Q: Sur Windows, j'ai "bash: command not found"

**R**: Vous utilisez probablement PowerShell ou CMD au lieu de Git Bash. Installez [Git for Windows](https://git-scm.com/download/win) et utilisez Git Bash.

### Q: Comment sortir du terminal après l'exécution?

**R**: Tapez simplement `exit` ou fermez la fenêtre.

## 🎓 Apprendre les Bases du Terminal

### Commandes Essentielles

| Commande | Description | Exemple |
|----------|-------------|---------|
| `pwd` | Afficher le dossier actuel | `pwd` |
| `ls` | Lister les fichiers | `ls` |
| `cd` | Changer de dossier | `cd Documents` |
| `cd ..` | Remonter d'un niveau | `cd ..` |
| `clear` | Effacer l'écran | `clear` |

### 💪 Exercice Pratique

Essayez ces commandes dans l'ordre:

```bash
# 1. Où suis-je?
pwd

# 2. Que contient ce dossier?
ls

# 3. Entrer dans le dossier "scripts"
cd scripts

# 4. Lister les fichiers
ls

# 5. Revenir en arrière
cd ..

# 6. Afficher à nouveau où je suis
pwd
```

## 🔗 Ressources Utiles

### Documentation
- [Guide complet de déploiement](../DEPLOYMENT.md)
- [Documentation des scripts](../scripts/README.md)
- [Guide d'administration](./ADMIN_SETUP.md)

### Tutoriels Terminal
- [Terminal pour débutants (EN)](https://www.youtube.com/watch?v=oxuRxtrO2Ag)
- [Cours Git Bash Windows (FR)](https://www.youtube.com/watch?v=USjZcfj8yxE)
- [Terminal macOS (FR)](https://www.youtube.com/watch?v=FtZFkfXsD_Y)

### Support
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)

## ✅ Checklist de Démarrage

Cochez au fur et à mesure:

- [ ] Terminal installé (Git Bash sur Windows)
- [ ] Node.js installé ([télécharger](https://nodejs.org/))
- [ ] Supabase CLI installé (`npm install -g supabase`)
- [ ] Projet cloné sur mon ordinateur
- [ ] Terminal ouvert dans le dossier du projet
- [ ] Script rendu exécutable (`chmod +x`)
- [ ] Script exécuté avec succès
- [ ] Application accessible sur http://localhost:5173

## 🆘 Besoin d'Aide?

Si vous êtes bloqué:

1. **Relisez attentivement les messages d'erreur** - ils contiennent souvent la solution
2. **Vérifiez les prérequis** - Node.js et Supabase CLI doivent être installés
3. **Consultez les logs** - ils vous indiqueront où ça bloque
4. **Cherchez l'erreur sur Google** - beaucoup de développeurs ont eu le même problème

## 🎉 Prochaines Étapes

Une fois le script lancé avec succès:

1. **Accédez à l'application**: http://localhost:5173
2. **Connectez-vous** avec un des comptes démo:
   - Admin: `admin@stock.local` / `admin123`
   - Magasinier: `magasinier@stock.local` / `mag123`
   - Acheteur: `acheteur@stock.local` / `ach123`
   - Lecteur: `lecteur@stock.local` / `lec123`
3. **Explorez l'interface** Supabase: http://localhost:54323

---

**Félicitations! 🎊** Vous avez lancé votre première application avec le terminal!
