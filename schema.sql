-- Script SQL idempotent pour Supabase (Exécutable autant de fois que souhaité sans erreur)
-- Copiez-collez ce script dans : Supabase Dashboard > SQL Editor > New Query > Run

-- 1. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS suisse_prep_data (
  sync_key TEXT PRIMARY KEY DEFAULT 'suisse2027_default',
  sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  logistics JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE suisse_prep_data ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques si elles existent pour éviter l'erreur 42710
DROP POLICY IF EXISTS "Allow public read" ON suisse_prep_data;
DROP POLICY IF EXISTS "Allow public insert" ON suisse_prep_data;
DROP POLICY IF EXISTS "Allow public update" ON suisse_prep_data;

-- 4. Recréer les politiques d'accès public
CREATE POLICY "Allow public read" ON suisse_prep_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON suisse_prep_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON suisse_prep_data FOR UPDATE USING (true);

-- 5. Activer le temps réel (ignore si déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'suisse_prep_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE suisse_prep_data;
  END IF;
END $$;
