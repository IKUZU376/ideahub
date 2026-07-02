-- Seed file for permanent reference data
-- Executed after initial schema migrations

-- Populate core club departments
insert into public.departments (name, description) values
  ('IIC', 'Institution Innovation Council initiatives and entrepreneurship'),
  ('STARTUP', 'Startup incubation, pitching mentorship, and founder networking'),
  ('EVENTS', 'Planning and executing club mixers, fests, and workshops'),
  ('OPERATION', 'Logistics planning, volunteer management, and execution'),
  ('CREATIVE', 'Graphic design assets, branding, and theme development'),
  ('MEDIA', 'Videography, photography, and social media production'),
  ('SPONSORSHIP', 'Sponsorship outreach and corporate partnerships'),
  ('PR', 'Public relations, external communication, and outreach'),
  ('MARKETING', 'Marketing strategy, campaigns, and audience engagement'),
  ('TECHNICAL', 'Software development, website management, and technical support')
on conflict (name) do nothing;
