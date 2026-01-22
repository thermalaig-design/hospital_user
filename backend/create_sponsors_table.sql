-- Create sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  positions TEXT[], -- Array to store multiple positions
  about TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Lower number means higher priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for active sponsors
CREATE POLICY "Allow public read access for active sponsors" ON public.sponsors
FOR SELECT USING (is_active = true);

-- Create policy to allow admin write access
CREATE POLICY "Allow admin write access to sponsors" ON public.sponsors
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better query performance
CREATE INDEX idx_sponsors_active_priority ON public.sponsors (is_active, priority);
CREATE INDEX idx_sponsors_created_at ON public.sponsors (created_at);

-- Create trigger to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sponsors_updated_at 
BEFORE UPDATE ON public.sponsors 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.sponsors (name, position, positions, about, photo_url, priority, created_by) VALUES
(
  'Dr. Meena Subhash Gupta',
  'President',
  ARRAY[
    'President',
    'Founder Chairperson - Mahila Mandal Punjabi Bagh',
    'Vice Chairperson - Innovative Co-Operative Bank',
    'Chairperson - Nav Dristhi Education & Welfare Society'
  ],
  'Dr. Meena Subhash Gupta is a renowned leader with extensive experience in healthcare and social welfare. She has been instrumental in advancing community services.',
  '/assets/president.png',
  0,
  'admin'
);