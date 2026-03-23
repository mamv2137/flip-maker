-- Schedule daily cleanup of expired view fingerprints (requires pg_cron extension enabled)
SELECT cron.schedule(
  'cleanup-view-fingerprints',
  '0 3 * * *',
  'SELECT public.cleanup_old_fingerprints()'
);
