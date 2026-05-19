import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export function useAdminAccess() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAdmin() {
      if (authLoading) return;

      if (!user?.id) {
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data?.user_id);
      }

      setLoading(false);
    }

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading]);

  return { isAdmin, loading: loading || authLoading };
}
