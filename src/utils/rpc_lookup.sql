-- ########################################################
-- # GROWTH BUNKER: SECURE REFERRER LOOKUP RPC            #
-- ########################################################

-- Function to securely look up a user ID by phone number
-- This function runs with SECURITY DEFINER privileges to bypass RLS
-- BUT it only returns the ID, limiting data exposure.

CREATE OR REPLACE FUNCTION get_referrer_id_by_phone(phone_number TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_id UUID;
BEGIN
    SELECT id INTO referrer_id
    FROM public.profiles
    WHERE phone = phone_number
    LIMIT 1;
    
    RETURN referrer_id;
END;
$$;

-- Grant execution to authenticated and anon users (needed for registration)
GRANT EXECUTE ON FUNCTION get_referrer_id_by_phone(TEXT) TO anon, authenticated;
