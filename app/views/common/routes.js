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
            id: (id) => {
                return `/chats/recents/${id}`;
            }
        },
        contacts: {
            __: '/chats/contacts',
            id: (id) => {
                return `/chats/contacts/${id}`;
            }
        },
        groups: {
            __: '/chats/groups',
            id: (id) => {
                return `/chats/groups/${id}`;
            }
        }
    }
};
