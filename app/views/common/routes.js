export default {
    chats: {
        _: '/chats',
        __: '/chats/:filterType/:id?',
        chat: {
            __: '/chats/:filterType/:id',
            id: (id, filterType) => (`/chats/${filterType || ':filterType'}/${id}`)
        },
        recents: {
            __: '/chats/recents',
            id: (id) => (`/chats/recents/${id}`)
        },
        contacts: {
            __: '/chats/contacts',
            id: (id) => (`/chats/contacts/${id}`)
        },
        groups: {
            __: '/chats/groups',
            id: (id) => (`/chats/groups/${id}`)
        }
    }
};
