export default {
    chats: {
        _: '/chats',
        __: '/chats/:filterType/:id?',
        chat: {
            __: '/chats/:filterType/:id',
            id: (id, filterType) => {
                return `/chats/${filterType || ':filterType'}/${id}`
            }
        },
        recents: {
            __: '/chats/recents',
        },
        contacts: {
            __: '/chats/contacts',
        },
        groups: {
            __: '/chats/groups',
        }
    }
};
