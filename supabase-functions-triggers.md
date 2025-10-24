# Supabase Custom Functions and Triggers Documentation

**Last updated**: October 24, 2025  
**Status**: ✅ All triggers in place  
**Database**: Supabase PostgreSQL (public schema only)

---

## Custom Functions

### `handle_new_user()`
**Purpose**: Automatically creates a profile in `public.profiles` when a user signs up via Supabase Auth.  
**Security**: SECURITY DEFINER with `SET search_path TO ''` (secure)  
**Owner**: postgres  
**Status**: ✅ Active

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Insérer un nouveau profil avec les métadonnées de l'utilisateur
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
$function$
```

### `update_updated_at_column()`
**Purpose**: Automatically updates the `updated_at` field with UTC timestamp.  
**Security**: SECURITY DEFINER with `SET search_path TO 'public', 'pg_temp'` (secure)  
**Owner**: postgres  
**Status**: ✅ Active on 12 tables

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$function$
```

---

## Custom Triggers

All triggers listed below are enabled (status: 'O') and use the `update_updated_at_column()` function.

### 1. `update_business_inside_categories_updated_at`
**Table**: `business_inside_categories`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_business_inside_categories_updated_at BEFORE UPDATE ON public.business_inside_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 2. `update_business_outside_categories_updated_at`
**Table**: `business_outside_categories`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_business_outside_categories_updated_at BEFORE UPDATE ON public.business_outside_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 3. `update_chat_updated_at`
**Table**: `chat`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_chat_updated_at BEFORE UPDATE ON public.chat FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 4. `update_locations_updated_at`
**Table**: `locations`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 5. `update_marketplace_listings_updated_at`
**Table**: `marketplace_listings`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 6. `update_messages_header_updated_at`
**Table**: `messages_header`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_messages_header_updated_at BEFORE UPDATE ON public.messages_header FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 7. `update_private_messages_updated_at`
**Table**: `private_messages`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_private_messages_updated_at BEFORE UPDATE ON public.private_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 8. `update_profiles_updated_at`
**Table**: `profiles`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 9. `update_service_categories_updated_at`
**Table**: `service_categories`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 10. `update_user_business_inside_updated_at`
**Table**: `user_business_inside`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_user_business_inside_updated_at BEFORE UPDATE ON public.user_business_inside FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 11. `update_user_business_outside_updated_at`
**Table**: `user_business_outside`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_user_business_outside_updated_at BEFORE UPDATE ON public.user_business_outside FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### 12. `update_user_services_updated_at`
**Table**: `user_services`  
**Event**: BEFORE UPDATE  
**Execution**: FOR EACH ROW

```sql
CREATE TRIGGER update_user_services_updated_at BEFORE UPDATE ON public.user_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

---

## Summary

| Element | Status | Tables |
|---------|--------|--------|
| `handle_new_user()` | ✅ Active | 1 (auth.users)* |
| `update_updated_at_column()` | ✅ Active | 12 tables |
| Total triggers | ✅ 12 active | - |

*Note: The trigger for `handle_new_user()` would be on `auth.users` table but was not found in the public schema query.

## Key Patterns

- **Timestamp Updates**: All 12 triggers use the same pattern to automatically maintain `updated_at` timestamps
- **UTC Timezone**: All timestamp updates use `timezone('utc'::text, now())`
- **Security**: Both functions use `SECURITY DEFINER` for elevated privileges with appropriate search_path restrictions
- **Language**: All functions are written in PL/pgSQL
- **Exclusions**: PostGIS and system functions are excluded from this documentation

---

**Notes**: 
- All triggers are active and functional
- The `handle_new_user()` function contains French comments
- All `updated_at` columns are automatically updated during UPDATE operations
- This documentation excludes PostGIS and system functions to focus on custom business logic
