import Platform from 'Platform';
import chats from './im-chats';
import ui from './im-ui';
import DelayAction from '../../utils/delay-action';
import notice from '../notice';
import Lang from '../../lang';
import profile from '../profile';
import members from '../members';

const getPlainTextOfChatMessage = (chatMessage, limitLength = 255, ignoreBreak = true) => {
    if (chatMessage.isFileContent) {
        return `[${Lang.format('file.title.format', chatMessage.fileContent.name)}]`;
    }
    if (chatMessage.isImageContent) {
        return `[${Lang.string('file.image.title')}]`;
    }
    let plainText = chatMessage.renderedTextContent(ui.renderChatMessageContent).replace(/<(?:.|\n)*?>/gm, '');
    if (ignoreBreak) {
        plainText = plainText.trim().replace(/[\r\n]/g, ' ').replace(/\n[\s| | ]*\r/g, '\n');
    }
    if (limitLength && plainText.length > limitLength) {
        plainText = plainText.substr(0, limitLength);
    }
    return plainText;
};

let lastNoticeChat = null;
let lastNoticeInfo = {};
const updateChatNoticeTask = new DelayAction(() => {
    const userConfig = profile.userConfig;
    if (!userConfig) {
        return;
    }

    let total = 0;
    let lastChatMessage = null;
    let notMuteCount = 0;

    chats.forEach(chat => {
        if (chat.noticeCount) {
            const isWindowFocus = Platform.ui.isWindowFocus;
            const isActiveChat = ui.isActiveChat(chat.gid);
            if (isWindowFocus && isActiveChat) {
                const mutedMessages = chat.muteNotice();
                if (mutedMessages && mutedMessages.length) {
                    chats.saveChatMessages(chat.messages, chat);
                }
            } else {
                total += chat.noticeCount;
                const chatLastMessage = chat.lastMessage;
                if (chatLastMessage && (!lastChatMessage || lastChatMessage.date < chatLastMessage.date)) {
                    lastChatMessage = chatLastMessage;
                    if (!chat.isMuteOrHidden) {
                        lastNoticeChat = chat;
                    }
                }
                if (!chat.isMuteOrHidden) {
                    notMuteCount += chat.noticeCount;
                }
            }
        }
    });

    let message = null;
    if (total && notMuteCount > 0 && lastNoticeInfo.notMuteCount < notMuteCount && lastNoticeInfo.total < total && userConfig.enableWindowNotification && (Platform.type === 'browser' || notice.isMatchWindowCondition(userConfig.windowNotificationCondition))) {
        message = userConfig.safeWindowNotification ? {
            title: Lang.format('notification.receviedMessages.format', total),
        } : {
            title: lastNoticeChat.isOne2One ? Lang.format('notification.memberSays.format', lastChatMessage.getSender(members).displayName) : Lang.format('notification.memberSaysInGroup.format', lastChatMessage.getSender(members).displayName, lastNoticeChat.getDisplayName({members, user: profile.user})),
            body: getPlainTextOfChatMessage(lastChatMessage)
        };
        if (lastNoticeChat.isOne2One) {
            const theOtherOne = lastNoticeChat.getTheOtherOne({members, user: profile.user});
            const avatar = theOtherOne.getAvatar(profile.user && profile.user.server);
            if (avatar) {
                message.icon = avatar;
            }
        }
        message.click = () => {
            window.location.hash = `#/chats/recents/${lastNoticeChat.gid}`;
            if (Platform.ui.showAndFocusWindow) {
                Platform.ui.showAndFocusWindow();
            }
        };
    }

    let sound = false;
    if (
        total &&
        notMuteCount > 0 &&
        lastNoticeInfo.total < total &&
        lastNoticeInfo.notMuteCount < notMuteCount &&
        userConfig.enableSound &&
        (!userConfig.muteOnUserIsBusy || !profile.user.isBusy) &&
        notice.isMatchWindowCondition(userConfig.playSoundCondition)) {
        sound = true;
    }

    const tray = {label: total ? Lang.format('notification.receviedMessages.format', total) : ''};
    if (
        total &&
        notMuteCount > 0 &&
        lastNoticeInfo.notMuteCount < notMuteCount &&
        userConfig.flashTrayIcon &&
        notice.isMatchWindowCondition(userConfig.flashTrayIconCondition)
    ) {
        tray.flash = true;
    }

    lastNoticeInfo = {total, chats: total, message, sound, tray, notMuteCount}
    notice.update(lastNoticeInfo);
}, 200);

const runChatNoticeTask = () => {
    updateChatNoticeTask.do();
};

chats.onChatMessages(runChatNoticeTask);

Platform.ui.onWindowFocus(() => {
    const activedChat = ui.currentActiveChat;
    if (activedChat && activedChat.noticeCount) {
        activedChat.muteNotice();
        chats.saveChatMessages(activedChat.messages, activedChat);
    }
});

if (Platform.ui.onWindowRestore) {
    Platform.ui.onWindowRestore(() => {
        const activedChat = ui.currentActiveChat;
        if (lastNoticeChat && lastNoticeChat.noticeCount && (!activedChat || (!activedChat.noticeCount && activedChat.gid !== lastNoticeChat.gid))) {
            window.location.hash = `#/chats/recents/${lastNoticeChat.gid}`;
        }
    });
}

export default {
    updateChatNotice: updateChatNoticeTask.do
};
