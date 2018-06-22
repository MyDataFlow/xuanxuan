// 从全局扩展对象中引入模块
const {
    utils,
    nodeModules
} = global.Xext;

const $ = nodeModules.jquery;

const ACTION_ICONS = {
    '完成': 'mdi-check-circle',
    '取消': 'mdi-cancel',
    '工时': 'mdi-clock-outline',
    '日志': 'mdi-clock-outline',
    '指派': 'mdi-hand-pointing-right',
    '执行': 'mdi-play-box-outline',
    '结果': 'mdi-playlist-play',
};

const RENDER_RULES = {
    task: {
        icon: 'mdi-clipboard-check-outline',
        color: 'green',
        name: '任务',
        simple_attrs: ['优先级', '任务状态', '最初预计', '总消耗', '预计剩余', '指派', '所属项目', '所属模块', '相关需求', '由谁创建'],
        attrs: ['任务描述', '需求描述', '验收标准']
    },
    bug: {
        icon: 'mdi-bug',
        color: 'red',
        name: 'Bug',
        simple_attrs: ['Bug状态', '优先级', '严重程度', 'Bug类型', '操作系统', '浏览器', '影响版本', '解决版本', '当前指派', '是否确认', '所属产品', '所属模块', '所属计划', '相关需求', '相关任务', '由谁创建'],
        attrs: ['重现步骤']
    },
    story: {
        icon: 'mdi-lightbulb-on-outline',
        color: 'blue',
        name: '需求',
        simple_attrs: ['当前状态', '所处阶段', '优先级', '预计工时', '需求来源', '所属产品', '所属平台', '所属模块', '由谁创建'],
        attrs: ['需求描述', '验收标准']
    },
    case: {
        icon: 'mdi-flag-outline',
        color: 'yellow',
        name: '用例',
        simple_attrs: ['优先级', '用例状态', '用例类型', '适用阶段', '执行时间', '结果', '所属产品', '所属模块', '相关需求', '由谁创建'],
        attrs: ['前置条件', '用例步骤']
    },
    doc: {
        icon: 'mdi-file-document-outline',
        color: 'purple',
        name: '文档',
        simple_attrs: ['所属产品', '所属文档库', '所属分类', '添加时间', '由谁编辑', '编辑时间'],
        attrs: ['文档正文']
    }
};

const renderObject = object => {
    const rule = RENDER_RULES[object.type];
    if (!rule) return;

    const $content = $('<div></div>');
    const $simpleAttrs = $('<ul class="attrs"></ul>');
    rule.simple_attrs.forEach(attrName => {
        $simpleAttrs.append('<li><strong class="attr-name">' + attrName + ':</strong> <span class="attr-value">' + (object.attrs[attrName] || '<span class="muted">无</span>') + '</span></li>');
    });
    $simpleAttrs.appendTo($content);

    rule.attrs.forEach((attrName, idx) => {
        const attrValue = object.attrs[attrName];
        const $detail = $('<details' + (idx < 1 ? ' open' : '') + '><summary>' + attrName + '</summary><div class="detail-content">' + (attrValue || '<span class="muted">空</span>') + '</div></details>');
        $content.append($detail);
    });

    if (object.files && object.files.length) {
        const $files = $('<ul class="files" style="padding: 0; margin: 0; list-style: none"></ul>');
        object.files.forEach(file => {
            $files.append('<li><i class="icon mdi mdi-file-document muted"></i> <a href="' + file.url + '">' + file.name + ' <small class="muted">' + file.size + '</small></a></li>');
        });
        const $detail = $('<details open><summary>附件（共 ' + object.files.length + ' 个）</summary><div class="detail-content"></div></details>');
        $detail.find('.detail-content').append($files);
        $content.append($detail);
    }

    $content.find('a,img').each((idx, aEle) => {
        const $a = $(aEle);
        const attrName = $a.is('img') ? 'src' : 'href';
        const url = $a.attr(attrName);
        if (url.startsWith('/')) {
            $a.attr(attrName, object.rootUrl + url);
        } else if (!url.startsWith('https://') && !url.startsWith('http://')) {
            $a.attr(attrName, null);
        }
    });

    $content.find('.icon-angle-right').attr('class', 'icon mdi mdi-chevron-right icon-sm');
    return `<div class="object-content markdown-content">${$content.html()}</div>`;
};

module.exports = {
    onAttach: ext => {
    },
    onDetach: ext => {
    },
    urlInspectors: [{
        test: (/^https?:\/\/(\w+\.5upm\.com|pms\.zentao\.net)\/\w+/i),
        inspect: (meta, cardMeta, url) => {
            const object = {};
            if (meta.document.length < 300 && meta.document.includes('deny')) {
                cardMeta.title = url;
                cardMeta.subtitle = '无法获取内容，需要进行登录验证';
                cardMeta.actions = [{
                    url,
                    label: '打开浏览器并登录查看',
                    icon: 'mdi-open-in-new'
                }];
                return cardMeta;
            }
            if (meta.title.startsWith('TASK#') || meta.title.startsWith('TASK #')) {
                object.type = 'task';
            } else if (meta.title.startsWith('STORY #')) {
                object.type = 'story';
            } else if (meta.title.startsWith('BUG #')) {
                object.type = 'bug';
            } else if (meta.title.startsWith('CASE #')) {
                object.type = 'case';
            } else if (meta.title.startsWith('DOC #')) {
                object.type = 'doc';
            }
            if (object.type) {
                const $doc = $(meta.document);
                object.title = $doc.find('#titlebar>.heading>strong').text().trim();
                object.id = $doc.find('#titlebar>.heading>.prefix>strong').text().trim();
                object.attrs = {};
                object.rootUrl = meta.rootUrl;

                if (object.type === 'doc') {
                    const $content = $doc.find('.col-main>.main>.content');
                    const $fileList = $content.find('.file-content>.files-list');
                    if ($fileList.length) {
                        object.files = [];
                        $fileList.children('li').each((liIdx, liEle) => {
                            const $file = $(liEle);
                            object.files.push({
                                name: $file.children('a').text().trim(),
                                size: $file.children('span:first').text().trim()
                            });
                        });
                    }
                    $content.find('.files-list,.file-content').remove();
                    object.attrs['正文'] = $content.html();
                } else {
                    $doc.find('.col-main>.main>fieldset').not('#actionbox,#commentBox').each((idx, element) => {
                        const $filedSet = $(element);
                        const attrName = $filedSet.children('legend').text();
                        const $fileList = $filedSet.children('.files-list');
                        if (attrName === '附件' || attrName === 'File' || $fileList.length) {
                            object.files = [];
                            $fileList.children('li').each((liIdx, liEle) => {
                                const $file = $(liEle);
                                const $fileLink = $file.children('a');
                                object.files.push({
                                    url: $fileLink.attr('href'),
                                    name: $fileLink.text().trim(),
                                    size: $file.children('span:first').text().trim()
                                });
                            });
                        } else {
                            object.attrs[attrName] = $filedSet.children('.article-content,.content').html();
                        }
                    });
                }

                $doc.find('.col-side>.main>fieldset,.col-side>.main>.tabs').each((idx, element) => {
                    const $filedSet = $(element);
                    const groupName = $filedSet.children('legend').text();
                    const $table = $filedSet.find('table');
                    if ($table.length) {
                        $table.find('tr').each((trIdx, trElement) => {
                            const $tr = $(trElement);
                            object.attrs[$tr.find('th').text().trim()] = $tr.find('td:first').html();
                        });
                    }
                });

                object.actions = [{
                    url,
                    label: `查看${RENDER_RULES[object.type].name}`,
                    icon: 'mdi-open-in-new'
                }];
                $doc.find('.col-main>.main>.actions>.btn-group').first().find('a').each((idx, btnEle) => {
                    const $a = $(btnEle);
                    const actionUrl = $a.attr('href');
                    const label = $a.text().trim();
                    if (actionUrl && actionUrl.startsWith('/')) {
                        object.actions.push({
                            url: meta.rootUrl + actionUrl,
                            label,
                            icon: ACTION_ICONS[label]
                        });
                    }
                });

                cardMeta.icon = {
                    className: RENDER_RULES[object.type].color,
                    icon: RENDER_RULES[object.type].icon + ' icon-2x'
                };
                cardMeta.title = object.title;
                if (object.files && object.files.length) {
                    cardMeta.title += ` (${object.files.length} 个附件)`;
                }
                cardMeta.subtitle = `${object.type.toUpperCase()} #${object.id} ${url}`;
                cardMeta.url = null;

                cardMeta.desc = JSON.stringify(object);

                cardMeta.content = renderObject(object);
                cardMeta.htmlContent = true;
                cardMeta.objectType = object.type;

                cardMeta.actions = object.actions;
            }
            cardMeta.object = object;
            return cardMeta;
        }
    }]
};
