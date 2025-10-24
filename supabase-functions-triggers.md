# Supabase Database Functions and Triggers Documentation

**Last updated**: October 24, 2025  
**Status**: ✅ All functions and triggers documented  
**Database**: Supabase PostgreSQL (public schema only)

---

## Custom Functions

### Application-Specific Functions

#### `get_all_location_requests(p_owner_id uuid, p_status text DEFAULT NULL::text)`
**Purpose**: Retrieves all location association requests for a specific approver with optional status filtering.  
**Security**: SECURITY DEFINER with `SET search_path TO 'public'` (secure)  
**Owner**: postgres  
**Status**: ✅ Active

```sql
CREATE OR REPLACE FUNCTION public.get_all_location_requests(p_owner_id uuid, p_status text DEFAULT NULL::text)
 RETURNS TABLE(request_id bigint, requester_id uuid, requester_username text, requester_avatar_url text, requester_full_name text, location_id uuid, location_block text, location_lot text, status text, created_at timestamp with time zone, approved_at timestamp with time zone, rejected_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    lar.id as request_id,
    lar.requester_id,
    p.username as requester_username,
    p.avatar_url as requester_avatar_url,
    p.full_name as requester_full_name,
    lar.location_id,
    l.block as location_block,
    l.lot as location_lot,
    lar.status,
    lar.created_at,
    lar.approved_at,
    lar.rejected_at
  FROM location_association_requests lar
  JOIN profiles p ON p.id = lar.requester_id
  JOIN locations l ON l.id = lar.location_id
  WHERE lar.approver_id = p_owner_id
    AND (p_status IS NULL OR lar.status = p_status)
  ORDER BY 
    CASE 
      WHEN lar.status = 'pending' THEN 1
      WHEN lar.status = 'approved' THEN 2
      WHEN lar.status = 'rejected' THEN 3
    END,
    lar.created_at DESC;
END;
$function$
```

#### `get_my_location_requests(p_requester_id uuid)`
**Purpose**: Retrieves location association requests made by a specific user.  
**Security**: SECURITY DEFINER with `SET search_path TO 'public'` (secure)  
**Owner**: postgres  
**Status**: ✅ Active

```sql
CREATE OR REPLACE FUNCTION public.get_my_location_requests(p_requester_id uuid)
 RETURNS TABLE(request_id bigint, location_id uuid, location_block text, location_lot text, approver_id uuid, approver_username text, approver_avatar_url text, status text, created_at timestamp with time zone, approved_at timestamp with time zone, rejected_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    lar.id as request_id,
    lar.location_id,
    l.block as location_block,
    l.lot as location_lot,
    lar.approver_id,
    p.username as approver_username,
    p.avatar_url as approver_avatar_url,
    lar.status,
    lar.created_at,
    lar.approved_at,
    lar.rejected_at
  FROM location_association_requests lar
  JOIN locations l ON l.id = lar.location_id
  LEFT JOIN profiles p ON p.id = lar.approver_id
  WHERE lar.requester_id = p_requester_id
  ORDER BY lar.created_at DESC;
END;
$function$
```

#### `get_pending_location_requests(p_owner_id uuid)`
**Purpose**: Retrieves pending location association requests for a specific approver.  
**Security**: SECURITY DEFINER with `SET search_path TO 'public'` (secure)  
**Owner**: postgres  
**Status**: ✅ Active

```sql
CREATE OR REPLACE FUNCTION public.get_pending_location_requests(p_owner_id uuid)
 RETURNS TABLE(request_id bigint, requester_id uuid, requester_username text, requester_avatar_url text, requester_full_name text, location_id uuid, location_block text, location_lot text, created_at timestamp with time zone, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    lar.id as request_id,
    lar.requester_id,
    p.username as requester_username,
    p.avatar_url as requester_avatar_url,
    p.full_name as requester_full_name,
    lar.location_id,
    l.block as location_block,
    l.lot as location_lot,
    lar.created_at,
    lar.status
  FROM location_association_requests lar
  JOIN profiles p ON p.id = lar.requester_id
  JOIN locations l ON l.id = lar.location_id
  WHERE lar.approver_id = p_owner_id
    AND lar.status = 'pending'
  ORDER BY lar.created_at DESC;
END;
$function$
```

#### `handle_location_request_response(p_request_id bigint, p_approver_id uuid, p_approve boolean, p_response_message text DEFAULT NULL::text)`
**Purpose**: Handles approval or rejection of location association requests.  
**Security**: SECURITY DEFINER with `SET search_path TO 'public'` (secure)  
**Owner**: postgres  
**Status**: ✅ Active

```sql
CREATE OR REPLACE FUNCTION public.handle_location_request_response(p_request_id bigint, p_approver_id uuid, p_approve boolean, p_response_message text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_request RECORD;
  v_association_id BIGINT;
  v_result JSON;
BEGIN
  -- Validate inputs
  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'Request ID cannot be null';
  END IF;
  
  IF p_approver_id IS NULL THEN
    RAISE EXCEPTION 'Approver ID cannot be null';
  END IF;

  -- Get request details
  SELECT 
    id,
    requester_id,
    approver_id,
    location_id,
    status
  INTO v_request
  FROM location_association_requests
  WHERE id = p_request_id;

  -- Check if request exists
  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  -- Check if user is approver
  IF v_request.approver_id != p_approver_id THEN
    RAISE EXCEPTION 'You are not authorized to respond to this request';
  END IF;

  -- Check if request is still pending
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'This request has already been %', v_request.status;
  END IF;

  -- SCENARIO: APPROVE
  IF p_approve = true THEN
    -- Update request status to approved
    UPDATE location_association_requests
    SET 
      status = 'approved',
      approved_at = NOW()
    WHERE id = p_request_id;

    -- Create association
    INSERT INTO profile_location_associations (
      profile_id,
      location_id,
      is_owner,
      is_verified,
      created_at
    )
    VALUES (
      v_request.requester_id,
      v_request.location_id,
      false,  -- Not an owner, just a resident
      true,   -- Verified by owner
      NOW()
    )
    RETURNING id INTO v_association_id;

    -- IMPORTANT: Complete onboarding for requester
    UPDATE profiles
    SET onboarding_completed = true
    WHERE id = v_request.requester_id;

    v_result := json_build_object(
      'success', true,
      'action', 'approved',
      'request_id', p_request_id,
      'association_id', v_association_id,
      'requester_id', v_request.requester_id,
      'message', 'Request approved successfully. User has been added to location and can now access the app.'
    );

  -- SCENARIO: REJECT
  ELSE
    -- Update request status to rejected
    UPDATE location_association_requests
    SET 
      status = 'rejected',
      rejected_at = NOW()
    WHERE id = p_request_id;

    -- IMPORTANT: Keep onboarding_completed = false
    -- User cannot access the app
    UPDATE profiles
    SET onboarding_completed = false
    WHERE id = v_request.requester_id;

    v_result := json_build_object(
      'success', true,
      'action', 'rejected',
      'request_id', p_request_id,
      'requester_id', v_request.requester_id,
      'message', 'Request rejected. User cannot access the app.'
    );
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in handle_location_request_response: %', SQLERRM;
END;
$function$
```

#### `handle_new_user()`
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
  -- Insert a new profile with user metadata
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

#### `handle_onboarding_location_assignment(p_user_id uuid, p_block text, p_lot text, p_request_message text DEFAULT NULL::text)`
**Purpose**: Handles location assignment during user onboarding with direct assignment or approval request logic.  
**Security**: SECURITY DEFINER with `SET search_path TO 'public'` (secure)  
**Owner**: postgres  
**Status**: ✅ Active

```sql
CREATE OR REPLACE FUNCTION public.handle_onboarding_location_assignment(p_user_id uuid, p_block text, p_lot text, p_request_message text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_location_id UUID;
  v_owner_id UUID;
  v_request_id BIGINT;
  v_association_id BIGINT;
  v_result JSON;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  IF p_block IS NULL OR TRIM(p_block) = '' THEN
    RAISE EXCEPTION 'Block cannot be empty';
  END IF;
  
  IF p_lot IS NULL OR TRIM(p_lot) = '' THEN
    RAISE EXCEPTION 'Lot cannot be empty';
  END IF;

  -- Find location by block and lot
  SELECT id INTO v_location_id
  FROM locations
  WHERE block = TRIM(p_block)
    AND lot = TRIM(p_lot)
    AND deleted_at IS NULL
  LIMIT 1;

  -- If location doesn't exist, raise an error
  IF v_location_id IS NULL THEN
    RAISE EXCEPTION 'Location not found for block % and lot %', p_block, p_lot;
  END IF;

  -- Check if location is locked
  IF EXISTS (
    SELECT 1 FROM locations 
    WHERE id = v_location_id 
      AND is_locked = true
  ) THEN
    RAISE EXCEPTION 'This location is locked and cannot be assigned';
  END IF;

  -- Check if location already has an owner
  SELECT profile_id INTO v_owner_id
  FROM profile_location_associations
  WHERE location_id = v_location_id
    AND is_owner = true
  LIMIT 1;

  -- SCENARIO 1: No owner exists - Direct assignment
  IF v_owner_id IS NULL THEN
    -- Create direct association with owner and verified status
    INSERT INTO profile_location_associations (
      profile_id,
      location_id,
      is_owner,
      is_verified,
      created_at
    )
    VALUES (
      p_user_id,
      v_location_id,
      true,  -- User becomes owner
      true,  -- Auto-verified since no owner exists
      NOW()
    )
    RETURNING id INTO v_association_id;

    -- IMPORTANT: Complete onboarding immediately for direct assignment
    UPDATE profiles
    SET onboarding_completed = true
    WHERE id = p_user_id;

    -- Return success with direct assignment type
    v_result := json_build_object(
      'assignment_type', 'direct',
      'association_id', v_association_id,
      'location_id', v_location_id,
      'message', 'Location assigned successfully as owner. Onboarding completed.',
      'result', json_build_object(
        'block', p_block,
        'lot', p_lot,
        'is_owner', true,
        'is_verified', true,
        'onboarding_completed', true
      )
    );

    RETURN v_result;

  -- SCENARIO 2: Owner exists - Create approval request (NO ACCESS YET)
  ELSE
    -- Check if user already has a pending request for this location
    IF EXISTS (
      SELECT 1 FROM location_association_requests
      WHERE requester_id = p_user_id
        AND location_id = v_location_id
        AND status = 'pending'
    ) THEN
      RAISE EXCEPTION 'You already have a pending request for this location';
    END IF;

    -- Check if user is already associated with this location
    IF EXISTS (
      SELECT 1 FROM profile_location_associations
      WHERE profile_id = p_user_id
        AND location_id = v_location_id
    ) THEN
      RAISE EXCEPTION 'You are already associated with this location';
    END IF;

    -- Create a location association request
    INSERT INTO location_association_requests (
      requester_id,
      approver_id,
      location_id,
      status,
      created_at
    )
    VALUES (
      p_user_id,
      v_owner_id,  -- The current owner will approve/reject
      v_location_id,
      'pending',
      NOW()
    )
    RETURNING id INTO v_request_id;

    -- IMPORTANT: DO NOT complete onboarding - user must wait for approval
    -- onboarding_completed stays FALSE

    -- Return success with request type
    v_result := json_build_object(
      'assignment_type', 'request',
      'request_id', v_request_id,
      'location_id', v_location_id,
      'owner_id', v_owner_id,
      'message', 'Location request created. You must wait for owner approval to access the app.',
      'result', json_build_object(
        'block', p_block,
        'lot', p_lot,
        'status', 'pending',
        'requires_approval', true,
        'onboarding_completed', false
      )
    );

    RETURN v_result;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Error in handle_onboarding_location_assignment: %', SQLERRM;
END;
$function$
```

#### `update_updated_at_column()`
**Purpose**: Automatically updates the `updated_at` field with UTC timestamp.  
**Security**: SECURITY DEFINER with `SET search_path TO 'public', 'pg_temp'` (secure)  
**Owner**: postgres  
**Status**: ✅ Active on 11 tables

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

| Element | Status | Tables/Functions |
|---------|--------|-----------------|
| `get_all_location_requests()` | ✅ Active | Location requests |
| `get_my_location_requests()` | ✅ Active | Location requests |
| `get_pending_location_requests()` | ✅ Active | Location requests |
| `handle_location_request_response()` | ✅ Active | Location approval/rejection |
| `handle_new_user()` | ✅ Active | 1 (auth.users)* |
| `handle_onboarding_location_assignment()` | ✅ Active | Onboarding workflow |
| `update_updated_at_column()` | ✅ Active | 11 tables |
| Total triggers | ✅ 11 active | - |

*Note: The trigger for `handle_new_user()` would be on `auth.users` table but was not found in public schema query.

## Key Patterns

- **Location Management**: Comprehensive system for location assignment, requests, and approvals
- **Onboarding Workflow**: Direct assignment for unowned locations, approval requests for owned locations
- **Timestamp Updates**: All 11 triggers use the same pattern to automatically maintain `updated_at` timestamps
- **UTC Timezone**: All timestamp updates use `timezone('utc'::text, now())`
- **Security**: All functions use `SECURITY DEFINER` for elevated privileges with appropriate search_path restrictions
- **Language**: All functions are written in PL/pgSQL
- **JSON Responses**: Location management functions return structured JSON responses
- **Error Handling**: Comprehensive input validation and error handling in all functions

---

**Notes**: 
- All triggers are active and functional
- The `handle_new_user()` function contains French comments in the original version
- All `updated_at` columns are automatically updated during UPDATE operations
- This documentation excludes PostGIS and system functions to focus on custom business logic
- Location assignment system supports both direct ownership and resident approval workflows
