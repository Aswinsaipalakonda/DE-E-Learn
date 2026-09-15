// Browser-side API adapter matching client interface
export const createClient = () => {
  return {
    auth: {
      getUser: async () => {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' });
          if (!res.ok) return { data: { user: null }, error: null };
          const data = await res.json();
          return { data: { user: data.user }, error: null };
        } catch {
          return { data: { user: null }, error: null };
        }
      },
      signOut: async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        return { error: null };
      },
    },
    from: (tableName: string) => {
      let isSingle = false;
      const filters: Record<string, any> = {};

      const builder = {
        select: (cols?: string) => builder,
        eq: (col: string, val: any) => { filters[col] = val; return builder; },
        lte: (col: string, val: any) => builder,
        gte: (col: string, val: any) => builder,
        or: (orStr: string) => builder,
        order: (col: string, opts?: any) => builder,
        limit: (n: number) => builder,
        single: () => { isSingle = true; return builder; },
        then: async (resolve: (val: any) => void) => {
          try {
            if (tableName === 'announcements') {
              const res = await fetch('/api/announcements', { credentials: 'include' });
              const json = await res.json();
              resolve({ data: json.announcements || [], error: null });
            } else if (tableName === 'users') {
              const res = await fetch('/api/auth/me', { credentials: 'include' });
              const json = await res.json();
              resolve({ data: json.user || null, error: null });
            } else {
              resolve({ data: [], error: null });
            }
          } catch (err: any) {
            resolve({ data: null, error: { message: err.message } });
          }
        },
      };

      return builder;
    },
  };
};
