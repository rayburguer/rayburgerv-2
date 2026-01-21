DO $$
DECLARE r record;
BEGIN
    FOR r IN (SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles') LOOP
        RAISE NOTICE 'profiles: % %', r.column_name, r.data_type;
    END LOOP;
    FOR r IN (SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders') LOOP
        RAISE NOTICE 'orders: % %', r.column_name, r.data_type;
    END LOOP;
END$$;
