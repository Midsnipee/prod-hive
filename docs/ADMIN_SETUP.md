# Configuration de l'administrateur par défaut

## Création de l'admin en production

Pour créer l'administrateur par défaut de l'application, utilisez l'edge function `bulk-create-users` :

### Via l'interface d'administration

1. Connectez-vous en tant qu'admin existant (si disponible)
2. Allez dans Paramètres > Utilisateurs
3. Cliquez sur "Importer CSV"
4. Téléchargez le modèle et remplissez-le avec :
   - Email: `admin@stock.local` (ou votre email d'admin)
   - Display Name: `Administrateur`
   - Role: `admin`
   - Department et Site: selon vos besoins

### Via appel direct à l'edge function

Si vous êtes le premier admin, vous pouvez créer l'utilisateur directement via le backend :

```bash
# Depuis le dashboard Lovable Cloud, exécutez cette requête
# ou utilisez curl avec votre service role key
```

## Sécurité

⚠️ **IMPORTANT** : 
- Changez le mot de passe par défaut immédiatement après la première connexion
- Ne partagez jamais les identifiants admin par email ou message non sécurisé
- Activez la double authentification dès que possible
- Limitez le nombre d'administrateurs au strict nécessaire

## Recommandations de mot de passe

- Minimum 12 caractères
- Mélange de majuscules, minuscules, chiffres et symboles
- Pas de mots du dictionnaire
- Unique pour cette application
- Stocké dans un gestionnaire de mots de passe

## Rôles disponibles

- **admin** : Accès complet à toutes les fonctionnalités
- **magasinier** : Gestion des stocks, matériels et numéros de série
- **acheteur** : Gestion des commandes et fournisseurs
- **lecteur** : Consultation uniquement
