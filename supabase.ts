import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

// Fetches all consultant profiles (admins excluded from management lists).
export function useConsultants() {
  const [consultants, setConsultants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'consultant')
      .order('full_name', { ascending: true });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setConsultants((data ?? []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { consultants, loading, error, refetch };
}
