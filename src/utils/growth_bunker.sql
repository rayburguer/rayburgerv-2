-- ########################################################
-- # GROWTH BUNKER: REFERRAL SECURITY & ANTI-FRAUD        #
-- ########################################################

-- 1. ANTI-FRAUD COLUMNS
-- Adding tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS signup_ip TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- 2. REFERRAL LOCKING (Immutability Trigger)
-- Once a user has a referrer, they cannot change it.
CREATE OR REPLACE FUNCTION protect_referral_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- If trying to change referred_by
    IF OLD.referred_by IS NOT NULL AND NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
        RAISE EXCEPTION 'Security Violation: Referral link is permanent and cannot be changed.';
    END IF;

    -- Prevent self-referral
    IF NEW.referred_by = NEW.id THEN
        RAISE EXCEPTION 'Security Violation: Users cannot refer themselves.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protect_referral ON public.profiles;
CREATE TRIGGER trigger_protect_referral
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION protect_referral_integrity();

-- 3. INDEXING
-- Optimize lookups for "Top Referrers" queries
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
