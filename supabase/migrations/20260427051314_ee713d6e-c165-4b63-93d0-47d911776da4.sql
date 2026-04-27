
-- Revoke broad execute, then re-grant only where needed.

-- validate_leave_status: trigger only — no one should call it directly
REVOKE EXECUTE ON FUNCTION public.validate_leave_status() FROM PUBLIC, anon, authenticated;

-- has_role: needed by RLS policies, only authenticated users
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- get_user_company_id: needed by RLS, only authenticated
REVOKE EXECUTE ON FUNCTION public.get_user_company_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_company_id(uuid) TO authenticated;

-- update_updated_at_column: trigger only
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- handle_new_user: trigger only (fires on auth.users insert)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
