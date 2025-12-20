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
    }
} as const;
