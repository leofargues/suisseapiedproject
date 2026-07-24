import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  getSyncKey, 
  setSyncKey, 
  getStoredSessions, 
  getStoredMetrics, 
  getStoredNotes,
  getStoredLogistics,
  saveStoredSessions, 
  saveStoredMetrics, 
  saveStoredNotes,
  saveStoredLogistics
} from './storage';

export { getSyncKey, setSyncKey };

// Fetch data from Cloud or fallback to LocalStorage
export const loadData = async (targetKey) => {
  const syncKey = targetKey ? setSyncKey(targetKey) : getSyncKey();

  if (!isSupabaseConfigured || !supabase) {
    return {
      source: 'local',
      sessions: getStoredSessions(syncKey),
      metrics: getStoredMetrics(syncKey),
      notes: getStoredNotes(syncKey),
      logistics: getStoredLogistics(syncKey)
    };
  }

  try {
    const { data, error } = await supabase
      .from('suisse_prep_data')
      .select('sessions, metrics, notes, logistics')
      .eq('sync_key', syncKey)
      .maybeSingle();

    if (error) {
      console.warn("Supabase select error:", error.message);
      throw error;
    }

    if (!data) {
      // Row doesn't exist yet for this sync key in Cloud. 
      // Initialize it strictly with the key's isolated local storage (which is empty if it's a new custom key).
      const localSessions = getStoredSessions(syncKey);
      const localMetrics = getStoredMetrics(syncKey);
      const localNotes = getStoredNotes(syncKey);
      const localLogistics = getStoredLogistics(syncKey);

      await supabase.from('suisse_prep_data').insert({
        sync_key: syncKey,
        sessions: localSessions,
        metrics: localMetrics,
        notes: localNotes,
        logistics: localLogistics,
        updated_at: new Date().toISOString()
      });

      return {
        source: 'cloud',
        sessions: localSessions,
        metrics: localMetrics,
        notes: localNotes,
        logistics: localLogistics
      };
    }

    // Remote data exists! Strict pull from cloud to local for this key.
    let finalSessions = data.sessions || [];
    let finalMetrics = data.metrics || [];
    let finalNotes = data.notes || [];
    let finalLogistics = data.logistics || [];

    // Smart Recovery: Check if the local storage FOR THIS KEY has sessions that failed to upload to the cloud
    const localSessions = getStoredSessions(syncKey);
    const localNotes = getStoredNotes(syncKey);
    const localLogistics = getStoredLogistics(syncKey);
    let needsUpload = false;

    const remoteSessionIds = new Set(finalSessions.map(s => s.id));
    localSessions.forEach(ls => {
      if (!remoteSessionIds.has(ls.id)) {
        finalSessions.push(ls);
        needsUpload = true;
      }
    });

    const remoteNoteIds = new Set(finalNotes.map(n => n.id));
    localNotes.forEach(ln => {
      if (!remoteNoteIds.has(ln.id)) {
        finalNotes.push(ln);
        needsUpload = true;
      }
    });

    const remoteLogisticsIds = new Set(finalLogistics.map(l => l.id));
    localLogistics.forEach(ll => {
      if (!remoteLogisticsIds.has(ll.id)) {
        finalLogistics.push(ll);
        needsUpload = true;
      }
    });

    // If we recovered unsynced tasks, force an upsert to the cloud immediately
    if (needsUpload) {
      await supabase.from('suisse_prep_data').upsert({
        sync_key: syncKey,
        sessions: finalSessions,
        metrics: finalMetrics,
        notes: finalNotes,
        logistics: finalLogistics,
        updated_at: new Date().toISOString()
      }, { onConflict: 'sync_key' });
    }

    if (finalSessions) saveStoredSessions(finalSessions, syncKey);
    if (finalMetrics) saveStoredMetrics(finalMetrics, syncKey);
    if (finalNotes) saveStoredNotes(finalNotes, syncKey);
    if (finalLogistics) saveStoredLogistics(finalLogistics, syncKey);

    return {
      source: 'cloud',
      sessions: finalSessions,
      metrics: finalMetrics,
      notes: finalNotes,
      logistics: finalLogistics
    };
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to LocalStorage:", err);
  }

  return {
    source: 'local',
    sessions: getStoredSessions(syncKey),
    metrics: getStoredMetrics(syncKey),
    notes: getStoredNotes(syncKey),
    logistics: getStoredLogistics(syncKey)
  };
};

// Push data updates to Cloud + LocalStorage
export const syncData = async (sessions, metrics, notes, logistics, targetKey) => {
  const syncKey = targetKey ? setSyncKey(targetKey) : getSyncKey();

  // Always update LocalStorage immediately for instant UI responsiveness
  saveStoredSessions(sessions, syncKey);
  saveStoredMetrics(metrics, syncKey);
  saveStoredNotes(notes, syncKey);
  saveStoredLogistics(logistics, syncKey);

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, mode: 'local' };
  }

  try {
    const { error: upsertErr } = await supabase
      .from('suisse_prep_data')
      .upsert({
        sync_key: syncKey,
        sessions,
        metrics,
        notes,
        logistics,
        updated_at: new Date().toISOString()
      }, { onConflict: 'sync_key' });

    if (upsertErr) throw upsertErr;

    return { success: true, mode: 'cloud' };
  } catch (err) {
    console.error("Cloud sync save error:", err);
    return { success: false, mode: 'local', error: err.message };
  }
};

// Subscribe to real-time changes across devices
export const subscribeToCloudChanges = (onDataReceived, targetKey) => {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const syncKey = targetKey || getSyncKey();

  const channel = supabase
    .channel(`suisse_realtime_${syncKey}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'suisse_prep_data',
        filter: `sync_key=eq.${syncKey}`
      },
      (payload) => {
        if (payload.new && payload.new.sync_key === syncKey) {
          const { sessions, metrics, notes, logistics } = payload.new;
          if (sessions) saveStoredSessions(sessions, syncKey);
          if (metrics) saveStoredMetrics(metrics, syncKey);
          if (notes) saveStoredNotes(notes, syncKey);
          if (logistics) saveStoredLogistics(logistics, syncKey);
          onDataReceived({ sessions, metrics, notes, logistics });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
