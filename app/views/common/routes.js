export default {
    chats: {
        _: 'chats',
        __: '/chats',
        chat: {
            _: ':filterType/:id',
            __: '/chats/:filterType/:id',
            id: (id, filterType) => {
                return `/chats/${filterType || ':filterType'}/${id}`
            }
        },
        recents: {
            _: 'recents',
            __: '/chats/recents',
        },
        contacts: {
            _: 'contacts',
            __: '/chats/contacts',
        },
        groups: {
            _: 'groups',
            __: '/chats/groups',
        }
    }
};
