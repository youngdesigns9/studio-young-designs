-- CREATE TABLE FOR WHY CHOOSE US
CREATE TABLE IF NOT EXISTS public.why_choose_us (
    id bigint primary key generated always as identity,
    title text not null,
    description text not null,
    is_visible boolean not null default true,
    display_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES FOR public.why_choose_us
CREATE POLICY "Allow public read on why_choose_us" 
ON public.why_choose_us FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated insert on why_choose_us" 
ON public.why_choose_us FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on why_choose_us" 
ON public.why_choose_us FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete on why_choose_us" 
ON public.why_choose_us FOR DELETE 
TO authenticated 
USING (true);

-- SEED DATA IF EMPTY
INSERT INTO public.why_choose_us (title, description, display_order)
SELECT '40+ Years Experience', 'A four-decade practice, refined project by project.', 0
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us);

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Bespoke Designs', 'Every space drawn from the ground up around how you live.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Bespoke Designs');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Premium Materials', 'Walnut, oak, natural stone, brass — sourced without compromise.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Premium Materials');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Turnkey Execution', 'One studio, from first sketch to final handover.', 3
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Turnkey Execution');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Expert Craftsmanship', 'In-house atelier with master carpenters and finishers.', 4
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Expert Craftsmanship');

INSERT INTO public.why_choose_us (title, description, display_order)
SELECT 'Personalized Design Process', 'A slow, considered dialogue with each client.', 5
WHERE NOT EXISTS (SELECT 1 FROM public.why_choose_us WHERE title = 'Personalized Design Process');
