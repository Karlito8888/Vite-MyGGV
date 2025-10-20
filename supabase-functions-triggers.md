# Fonctions et Triggers Personnalisés

## Fonctions

### `handle_new_user()`
**Résumé** : Crée automatiquement un profil dans `public.profiles` quand un utilisateur s'inscrit via Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;
```

### `update_updated_at_column()`
**Résumé** : Met à jour automatiquement le champ `updated_at` avec l'heure UTC.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### `on_auth_user_created`
**Résumé** : Déclenche `handle_new_user()` après chaque nouvel utilisateur inscrit.

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```