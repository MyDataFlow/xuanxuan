import React from 'react';
import Modal from '../../components/modal';
import AboutView from './about';
import Lang from '../../lang';

const show = (member, callback) => {
    return Modal.show({
        title: Lang.string('common.about'),
        actions: false,
        id: 'app-about-dialog',
        content: <AboutView />
    }, callback);
};

export default {
    show,
};
