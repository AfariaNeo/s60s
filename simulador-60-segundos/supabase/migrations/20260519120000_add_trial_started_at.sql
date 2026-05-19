-- Adiciona coluna para controlar início do trial de usuários legados
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN profiles.trial_started_at IS
  'Data em que o usuário legado (cadastrado antes do modelo híbrido) confirmou ciência do novo modelo. O trial de 30 dias conta a partir desta data.';
