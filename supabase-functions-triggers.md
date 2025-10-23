# Fonctions et Triggers Personnalisés

**Dernière mise à jour**: 24 octobre 2025  
**Statut**: ✅ Tous les triggers en place

---

## Fonctions

### `handle_new_user()`
**Résumé**: Crée automatiquement un profil dans `public.profiles` quand un utilisateur s'inscrit via Supabase Auth.  
**Sécurité**: SECURITY DEFINER avec `SET search_path TO ''` (sécurisé)  
**Statut**: ✅ Actif

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username',
    new.email
  );
  RETURN new;
END;
$$;
```

### `update_updated_at_column()`
**Résumé**: Met à jour automatiquement le champ `updated_at` avec l'heure UTC.  
**Sécurité**: SECURITY DEFINER avec `SET search_path TO 'public', 'pg_temp'` (sécurisé)  
**Statut**: ✅ Actif sur 12 tables

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;
```

---

## Triggers

### `on_auth_user_created`
**Table**: `auth.users`  
**Fonction**: `handle_new_user()`  
**Timing**: AFTER INSERT  
**Statut**: ✅ Actif

**Résumé**: Déclenche `handle_new_user()` après chaque nouvel utilisateur inscrit.

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### Triggers `update_updated_at`
**Fonction**: `update_updated_at_column()`  
**Timing**: BEFORE UPDATE  
**Statut**: ✅ Actifs sur 12 tables

**Résumé**: Met à jour automatiquement la colonne `updated_at` lors de chaque UPDATE.

**Tables avec trigger** (12):
1. ✅ `business_inside_categories`
2. ✅ `business_outside_categories`
3. ✅ `chat`
4. ✅ `locations`
5. ✅ `marketplace_listings`
6. ✅ `messages_header`
7. ✅ `private_messages`
8. ✅ `profiles`
9. ✅ `service_categories`
10. ✅ `user_business_inside`
11. ✅ `user_business_outside`
12. ✅ `user_services`

**Exemple de trigger**:
```sql
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Résumé

| Élément | Statut | Tables |
|---------|--------|--------|
| `handle_new_user()` | ✅ Actif | 1 (auth.users) |
| `update_updated_at_column()` | ✅ Actif | 12 tables |
| Total triggers | ✅ 13 actifs | - |

---

**Note**: Tous les triggers sont actifs et fonctionnels. Les colonnes `updated_at` sont maintenant mises à jour automatiquement lors des UPDATE.
