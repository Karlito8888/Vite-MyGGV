# update-supabase-functions

Met à jour le fichier `supabase-functions-triggers.md` avec les dernières fonctions et triggers personnalisés de la base de données Supabase.

## Usage

```bash
opencode update-supabase-functions
```

## Description

Cette commande extrait automatiquement depuis la base de données Supabase :
- Les fonctions personnalisées (hors PostGIS)
- Les triggers personnalisés 
- Génère le fichier `supabase-functions-triggers.md` à jour

## Fichiers modifiés

- `supabase-functions-triggers.md` - Mis à jour avec les dernières fonctions/triggers

## Notes

- Exclut automatiquement les fonctions PostGIS et système
- Se concentre sur les objets personnalisés du schéma `public`
- Format simple avec résumé et code SQL pour chaque objet