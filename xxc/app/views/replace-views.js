export default (path, originView) => {
    if (!originView) {
        console.error('Origin view must be set for ', path, originView);
    }
    return global.replaceViews && global.replaceViews[path] || originView;
};
