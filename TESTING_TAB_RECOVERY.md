# 🧪 Guide de test : Récupération après changement d'onglet

## ✅ Corrections apportées

### Problème identifié
Les connexions WebSocket Supabase Realtime entraient dans un état "zombie" après suspension de l'onglet :
- Techniquement "connectées" selon le client
- Mais ne recevant plus aucun message
- La vérification de "santé" ne détectait pas ce problème

### Solution implémentée
1. **État de connexion réactif** : Changement de `useRef` à `useState` pour `isConnected`
2. **Reconnexion forcée** : TOUJOURS reconnecter après 30+ secondes d'inactivité
3. **Suppression des faux positifs** : Plus de vérification de "santé" non fiable
4. **Simplification** : Moins de logique complexe = moins de bugs

## 🧪 Tests à effectuer

### Test 1 : Absence courte (< 30 secondes)
**Objectif** : Vérifier qu'on ne reconnecte PAS inutilement

1. Ouvrir la PWA et se connecter
2. Ouvrir la console développeur (F12)
3. Changer d'onglet pendant **15 secondes**
4. Revenir sur la PWA

**Résultat attendu** :
```
[REALTIME] 👁️ Page became visible, checking connection health...
[REALTIME] ✅ Short absence (15s), keeping connection
```
✅ Pas de reconnexion = NORMAL

---

### Test 2 : Absence longue (> 30 secondes) - TEST PRINCIPAL
**Objectif** : Vérifier la reconnexion automatique

1. Ouvrir la PWA et se connecter
2. Ouvrir la console développeur (F12)
3. Changer d'onglet pendant **1 minute** (60 secondes)
4. Revenir sur la PWA

**Résultat attendu** :
```
[REALTIME] 👁️ Page became visible, checking connection health...
[REALTIME] 🏥 Tab was hidden for 60 seconds, forcing reconnection
[PWA-RECOVERY] 👁️ Tab recovery #1 - PWA: false - Hidden for: 60s
[PWA-RECOVERY] 🏥 Checking Supabase health...
[PWA-RECOVERY] ✅ Supabase health check passed: 234ms
[PWA-RECOVERY] 🔌 Tab was hidden > 30s, forcing Realtime reconnection...
[GLOBAL-REALTIME] 🔄 Forcing reconnection of all channels
[REALTIME] 🔄 Reconnecting after long inactivity
[REALTIME] 🧹 Cleaning up subscription
[REALTIME] 🔌 Creating new subscription
[GLOBAL-REALTIME] 🔌 Subscribing to public messages
[GLOBAL-REALTIME] ✅ Public messages reconnected
[PWA-RECOVERY] ✅ Recovery completed
```
✅ Reconnexion automatique = SUCCÈS

---

### Test 3 : Multiples onglets
**Objectif** : Vérifier qu'il n'y a pas de conflits

1. Ouvrir 3 onglets de la PWA
2. Se connecter dans chaque onglet
3. Naviguer entre les onglets
4. Laisser chaque onglet inactif > 30s tour à tour

**Résultat attendu** :
- Chaque onglet reconnecte indépendamment
- Délais échelonnés (0-200ms aléatoires)
- Pas de messages d'erreur

---

### Test 4 : PWA installée
**Objectif** : Vérifier le délai réduit en mode PWA

1. Installer la PWA (si pas déjà fait)
2. Ouvrir l'app installée
3. Minimiser l'app pendant 1 minute
4. Rouvrir l'app

**Résultat attendu** :
```
[PWA-RECOVERY] 👁️ Tab recovery #1 - PWA: true - Hidden for: 60s
```
✅ Délai de reconnexion plus court (200ms au lieu de 1000ms)

---

## 🔍 Logs à surveiller

### Logs normaux (tout va bien)
```
[VISIBILITY] 👁️ Page is now: visible
[REALTIME] 👁️ Page became visible, checking connection health...
[REALTIME] 🏥 Tab was hidden for Xs, forcing reconnection
[PWA-RECOVERY] 🔌 Tab was hidden > 30s, forcing Realtime reconnection...
[REALTIME] 🔄 Reconnecting after long inactivity
[PWA-RECOVERY] ✅ Recovery completed
```

### Logs d'erreur (problème)
```
[REALTIME] ❌ Error creating subscription: ...
[PWA-RECOVERY] ❌ Recovery failed: ...
[VISIBILITY] ❌ Error checking session: ...
```

---

## 📊 Indicateurs de succès

### ✅ Test réussi si :
1. Après 1 minute d'absence, vous voyez les logs de reconnexion
2. Les messages Realtime arrivent à nouveau (testez en envoyant un message)
3. Pas besoin de refresh manuel
4. L'indicateur de récupération s'affiche brièvement (coin supérieur droit)

### ❌ Test échoué si :
1. Pas de logs de reconnexion après 1 minute d'absence
2. Les messages Realtime n'arrivent plus
3. Besoin de refresh manuel pour que ça fonctionne
4. Messages d'erreur dans la console

---

## 🐛 En cas de problème

### Si la reconnexion ne se déclenche pas :
1. Vérifier que vous êtes bien absent > 30 secondes
2. Vérifier que la console est ouverte pour voir les logs
3. Essayer de forcer la récupération (bouton dev mode)
4. Vérifier la connexion internet

### Si vous voyez des erreurs :
1. Copier les logs complets de la console
2. Vérifier l'état de Supabase (dashboard)
3. Vérifier les credentials (VITE_SUPABASE_URL, etc.)
4. Essayer un refresh complet (Ctrl+Shift+R)

---

## 🎯 Différences clés avec l'ancienne version

| Aspect | Avant | Maintenant |
|--------|-------|------------|
| Détection | Vérification de "santé" non fiable | Temps d'inactivité > 30s |
| État connexion | `useRef` (pas de re-render) | `useState` (réactif) |
| Reconnexion | Conditionnelle (parfois skip) | TOUJOURS si > 30s |
| Logs | Confus, faux positifs | Clairs, précis |

---

## 📝 Checklist de test

- [ ] Test 1 : Absence courte (< 30s) - Pas de reconnexion
- [ ] Test 2 : Absence longue (> 30s) - Reconnexion automatique
- [ ] Test 3 : Multiples onglets - Pas de conflits
- [ ] Test 4 : PWA installée - Délai réduit
- [ ] Messages Realtime fonctionnent après reconnexion
- [ ] Pas besoin de refresh manuel
- [ ] Indicateur visuel s'affiche pendant récupération

---

**Commit** : `9abe7b2`  
**Date** : 1er novembre 2025  
**Status** : ✅ Prêt pour test
