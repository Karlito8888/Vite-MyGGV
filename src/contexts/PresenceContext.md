# PresenceContext

Context React pour gérer la présence en temps réel des utilisateurs via Supabase Realtime.

## Responsabilités

- Tracker la présence en ligne de l'utilisateur connecté
- Gérer un channel Supabase Realtime dédié à la présence
- Synchroniser l'état de présence (online/offline)
- Nettoyer automatiquement les ressources lors de la déconnexion

## API

### Provider

```jsx
<PresenceProvider>
  {children}
</PresenceProvider>
```

### Hook

```jsx
const { isOnline, presenceChannel } = usePresence()
```

**Valeurs retournées :**
- `isOnline` (boolean) : Indique si l'utilisateur est actuellement en ligne
- `presenceChannel` (Channel | null) : Instance du channel Supabase pour la présence

## Fonctionnement

1. **Initialisation** : Lorsqu'un utilisateur est connecté, un channel Supabase unique est créé (`user_presence_${user.id}`)

2. **Événements écoutés** :
   - `sync` : Synchronise l'état de présence global
   - `join` : Détecte quand l'utilisateur rejoint le channel
   - `leave` : Détecte quand l'utilisateur quitte le channel

3. **Tracking** : Une fois le channel souscrit, les données suivantes sont trackées :
   - `user_id` : ID de l'utilisateur
   - `email` : Email de l'utilisateur
   - `online_at` : Timestamp de connexion

4. **Cleanup** : Lors de la déconnexion ou du démontage, le channel est correctement nettoyé avec `untrack()` et `removeChannel()`

## Dépendances

- `UserContext` : Nécessite un utilisateur authentifié pour fonctionner
- `supabase` : Client Supabase pour les channels Realtime

## Utilisation

```jsx
import { usePresence } from '../contexts/PresenceContext'

function MyComponent() {
  const { isOnline } = usePresence()
  
  return (
    <div>
      {isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}
    </div>
  )
}
```

## Notes

- Le provider doit être placé à l'intérieur de `UserProvider`
- Le channel est automatiquement nettoyé lors du logout
- Les erreurs sont loggées dans la console mais n'interrompent pas l'application
