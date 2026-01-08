
-- 1. Add new columns to PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;

-- 2. Create REWARDS table for "Raspadito"
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create FEEDBACK table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id),
    user_id UUID REFERENCES public.profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Trigger for FOUNDER (Assign true to first 20 users)
CREATE OR REPLACE FUNCTION check_founder_status()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT count(*) INTO user_count FROM public.profiles;
    -- If count is less than 20 (including this one being inserted which makes it <= 20 if we count after, but triggers run before or after. 
    -- Assuming BEFORE insert trigger would be best, but we need current count.
    
    -- Let's check existing count.
    IF user_count < 20 THEN
        NEW.is_founder := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_founder ON public.profiles;
CREATE TRIGGER trigger_check_founder
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION check_founder_status();
