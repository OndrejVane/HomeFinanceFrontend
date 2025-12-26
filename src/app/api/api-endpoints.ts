export const ApiEndpoints = {
    Auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh-token',
        logout: '/auth/logout'
    },

    Currency: {
        base: '/currency',
        byId: (id: number | string) => `/currency/${id}`
    },

    Account: {
        base: '/account',
        byId: (id: number | string) => `/account/${id}`,
        import: (id: number | string) => `/account/${id}/import`,
        stats: (id: number | string) => `/account/${id}/stats`
    },

    Movement: {
        base: '/movement',
        byId: (id: number | string) => `/movement/${id}`,
        monthlyWithParams: (year: number, month: number, type: string, accountId?: number | string): string => {
            const base = `/movement/stats/monthly?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}&type=${encodeURIComponent(type)}`;
            return accountId != null
                ? `${base}&accountId=${encodeURIComponent(accountId)}`
                : base;
        }
    },

    MovementTag: {
        base: '/movement-tag',
        byId: (id: number | string) => `/movement-tag/${id}`,
    }
} as const;
