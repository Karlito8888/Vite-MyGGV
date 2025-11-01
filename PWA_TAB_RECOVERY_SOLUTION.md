# Solution PWA Tab Switch Freeze

## Problème résolu

Lorsqu'un utilisateur quitte l'onglet de la PWA pour visiter un autre site web, puis revient sur la PWA, les connexions Supabase se "gèlent" (freeze) :
- Les connexions WebSocket Realtime sont coupées
- Les appels à la base de données ne répondent plus
- L'authentification peut expirer
- **Nécessitait un rafraîchissement manuel de la page**

### Cause technique

Les navigateurs (Chrome notamment) "gèlent" les onglets en arrière-plan pour économiser les ressources (CPU, mémoire, réseau). Lors de cette suspension :
1. Les WebSockets sont fermés
2. Les requêtes HTTP peuvent timeout
3. Le client Supabase ne détecte pas toujours la reprise

## Solution implémentée

### Architecture de la solution

```
┌─────────────────────────────────────────────────────────────┐
│                    App.jsx (Root)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PageVisibilityProvider                              │   │
│  │  - Détecte visibilitychange + focus                  │   │
│  │  - Vérifie session si caché > 30s                    │   │
│  │  - Rafraîchit token si proche expiration             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  GlobalRealtimeManager                               │   │
│  │  - Gère toutes les connexions Realtime               │   │
│  │  - Utilise useRealtimeConnection pour chaque canal   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PWARecoveryIndicator                                │   │
│  │  - Affiche l'état de récupération                    │   │
│  │  - Utilise usePWATabRecovery                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Composants clés

#### 1. PageVisibilityContext (Enhanced)
**Fichier** : `src/contexts/PageVisibilityContext.jsx`

**Améliorations** :
- ✅ Détection combinée `visibilitychange` + `focus` pour plus de fiabilité
- ✅ Calcul du temps passé en arrière-plan
- ✅ Vérification automatique de la session si caché > 30 secondes
- ✅ Rafraîchissement du token si proche de l'expiration (< 5 minutes)
- ✅ Délai de 500ms pour laisser le navigateur se stabiliser

#### 2. useRealtimeConnection (Enhanced)
**Fichier** : `src/hooks/useRealtimeConnection.js`

**Améliorations** :
- ✅ État de connexion détaillé : 'disconnected', 'connecting', 'connected', 'frozen'
- ✅ Vérification de santé de la connexion (détection de gel)
- ✅ Suivi de l'activité de la connexion (lastActivityRef)
- ✅ Reconnexion automatique uniquement si connexion gelée
- ✅ Délais échelonnés (100-200ms aléatoires) pour éviter les conflits

**Logique de détection de gel** :
```javascript
// Une connexion est considérée gelée si :
// - Aucune activité depuis > 30 secondes
// - ET l'onglet vient de redevenir visible
const timeSinceLastActivity = Date.now() - lastActivityRef.current
const isLikelyFrozen = timeSinceLastActivity > 30000
```

#### 3. usePWATabRecovery (Enhanced)
**Fichier** : `src/hooks/usePWATabRecovery.js`

**Nouvelles fonctionnalités** :
- ✅ Vérification de santé du client Supabase (timeout 5s)
- ✅ Rafraîchissement automatique de la session
- ✅ Reconnexion intelligente basée sur le temps d'inactivité
- ✅ Délais adaptatifs selon le contexte (PWA vs navigateur)
- ✅ État de récupération exposé (`isRecovering`)

**Workflow de récupération** :
```
1. Détection du retour sur l'onglet
   ↓
2. Calcul du temps passé en arrière-plan
   ↓
3. Si > 30s : Vérification santé Supabase
   ↓
4. Si client gelé : Rafraîchissement session
   ↓
5. Reconnexion des canaux Realtime
   ↓
6. Fin de la récupération
```

#### 4. PWARecoveryIndicator (New)
**Fichier** : `src/components/PWARecoveryIndicator.jsx`

**Fonctionnalités** :
- ✅ Indicateur visuel pendant la récupération
- ✅ Affichage du nombre de connexions actives
- ✅ Animation fluide (slide-in)
- ✅ Responsive (mobile-friendly)
- ✅ Bouton de récupération manuelle (dev mode uniquement)

### Flux de récupération détaillé

```
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur quitte l'onglet                                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  PageVisibilityContext détecte visibilitychange             │
│  - isVisible = false                                        │
│  - lastVisibleTime = Date.now()                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Navigateur gèle l'onglet (après ~30s)                      │
│  - WebSockets fermés                                        │
│  - Requêtes HTTP suspendues                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur revient sur l'onglet                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  PageVisibilityContext détecte le retour                    │
│  - isVisible = true                                         │
│  - timeHidden = Date.now() - lastVisibleTime                │
│  - Si timeHidden > 30s → Vérifier session                   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  usePWATabRecovery déclenché                                │
│  - Calcule timeHidden                                       │
│  - Vérifie état des connexions Realtime                     │
│  - Planifie récupération avec délai adaptatif               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Vérification santé Supabase (si timeHidden > 30s)          │
│  - Tentative getSession() avec timeout 5s                   │
│  - Si timeout ou lent (>3s) → Client gelé                   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Rafraîchissement session (si client gelé)                  │
│  - supabase.auth.refreshSession()                           │
│  - Mise à jour du token                                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Reconnexion Realtime (si nécessaire)                       │
│  - Cleanup des connexions existantes                        │
│  - Reconnexion avec délais échelonnés                       │
│  - Restauration des souscriptions                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ PWA fonctionnelle sans refresh manuel                   │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers modifiés

### Modifiés
1. ✅ `src/contexts/PageVisibilityContext.jsx` - Ajout vérification session
2. ✅ `src/hooks/useRealtimeConnection.js` - Ajout détection gel + santé
3. ✅ `src/hooks/usePWATabRecovery.js` - Ajout vérification Supabase
4. ✅ `src/hooks/index.js` - Export des nouveaux hooks
5. ✅ `src/hooks/README.md` - Documentation mise à jour
6. ✅ `src/App.jsx` - Ajout PWARecoveryIndicator

### Créés
1. ✅ `src/components/PWARecoveryIndicator.jsx` - Composant indicateur
2. ✅ `src/components/PWARecoveryIndicator.module.css` - Styles
3. ✅ `PWA_TAB_RECOVERY_SOLUTION.md` - Cette documentation

## Tests recommandés

### Test 1 : Tab switch simple
1. Ouvrir la PWA
2. Attendre que tout soit chargé
3. Changer d'onglet pendant 5 secondes
4. Revenir sur la PWA
5. ✅ Vérifier : Pas de reconnexion (connexions saines)

### Test 2 : Tab switch long
1. Ouvrir la PWA
2. Attendre que tout soit chargé
3. Changer d'onglet pendant 1 minute
4. Revenir sur la PWA
5. ✅ Vérifier : Récupération automatique visible
6. ✅ Vérifier : Connexions restaurées sans refresh

### Test 3 : Multiples onglets
1. Ouvrir 3 onglets de la PWA
2. Naviguer entre les onglets
3. ✅ Vérifier : Pas de conflits de reconnexion
4. ✅ Vérifier : Délais échelonnés dans les logs

### Test 4 : Mode PWA installée
1. Installer la PWA
2. Ouvrir l'app installée
3. Minimiser l'app pendant 1 minute
4. Rouvrir l'app
5. ✅ Vérifier : Récupération rapide (délai 200ms)

## Logs de débogage

Les logs suivants sont disponibles en mode développement :

```javascript
// PageVisibilityContext
[VISIBILITY] 👁️ Page is now: visible/hidden
[VISIBILITY] 🔐 Tab was hidden for X seconds, checking auth state...
[VISIBILITY] 🔄 Token expiring soon, refreshing session...
[VISIBILITY] ✅ Session refreshed successfully

// useRealtimeConnection
[REALTIME] 🔌 Creating new subscription
[REALTIME] 👁️ Page became visible, checking connection health...
[REALTIME] 🏥 Connection unhealthy, forcing reconnection
[REALTIME] ✅ Connection appears healthy, no reconnection needed
[REALTIME] 🔄 Reconnecting after visibility change

// usePWATabRecovery
[PWA-RECOVERY] 👁️ Tab recovery #X - PWA: true - Hidden for: Xs
[PWA-RECOVERY] 📊 Connections: X/Y active
[PWA-RECOVERY] 🏥 Checking Supabase health...
[PWA-RECOVERY] ✅ Supabase health check passed: Xms
[PWA-RECOVERY] 🔧 Supabase client appears frozen, refreshing session...
[PWA-RECOVERY] 🔌 Reconnecting Realtime channels...
[PWA-RECOVERY] ✅ Recovery completed
```

## Performance

### Délais de récupération
- **PWA installée** : 200ms + 0-200ms aléatoire = 200-400ms
- **Navigateur** : 1000ms + 0-200ms aléatoire = 1000-1200ms
- **Après 10+ changements** : 1500ms (throttling)

### Timeouts
- **Health check Supabase** : 5 secondes max
- **Réponse lente** : > 3 secondes = considéré gelé
- **Inactivité** : > 30 secondes = vérification nécessaire

## Conformité Supabase

✅ Utilise `supabase.auth.getSession()` pour vérifier la session  
✅ Utilise `supabase.auth.refreshSession()` pour rafraîchir  
✅ Respecte les événements `onAuthStateChange`  
✅ Gère correctement les souscriptions Realtime  
✅ Utilise `channel.unsubscribe()` avant reconnexion  

## Références

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [GitHub Issue: supabase/auth-js#762](https://github.com/supabase/auth-js/issues/762)

## Prochaines améliorations possibles

1. **Métriques** : Ajouter un système de métriques pour suivre les récupérations
2. **Retry exponential** : Implémenter un backoff exponentiel pour les échecs
3. **User feedback** : Toast notification pour informer l'utilisateur
4. **Offline mode** : Gérer le mode hors ligne complet
5. **Service Worker** : Intégrer avec le Service Worker pour plus de robustesse
