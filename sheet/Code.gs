/**
 * Beyond Century website: "Website" menu for the content Sheet.
 * Paste into Extensions → Apps Script in the Sheet, save, and reload the Sheet.
 * This and the contact form are the only host-specific pieces: to move hosts, change the build hook URL.
 */

var HOOK_KEY = 'NETLIFY_BUILD_HOOK';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Website')
    .addItem('Publish · 发布', 'publishSite')
    .addSeparator()
    .addItem('Set up · 设置', 'setBuildHook')
    .addToUi();
}

function setBuildHook() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.prompt(
    'Set up publishing · 设置发布',
    'Paste the Netlify build hook URL. · 请粘贴 Netlify 构建钩子网址。',
    ui.ButtonSet.OK_CANCEL
  );
  if (res.getSelectedButton() !== ui.Button.OK) return;
  var url = res.getResponseText().trim();
  if (!/^https:\/\/api\.netlify\.com\/build_hooks\/[A-Za-z0-9]+$/.test(url)) {
    ui.alert('That does not look like a Netlify build hook URL. · 这不是有效的 Netlify 构建钩子网址。');
    return;
  }
  PropertiesService.getScriptProperties().setProperty(HOOK_KEY, url);
  ui.alert('Publishing is set up. · 发布功能已设置完成。');
}

function publishSite() {
  var ui = SpreadsheetApp.getUi();
  var hook = PropertiesService.getScriptProperties().getProperty(HOOK_KEY);
  var failure =
    'Publishing could not start. Please contact the website administrator. · 无法开始发布，请联系网站管理员。';
  if (!hook) {
    ui.alert(failure + '\n\n(Website → Set up has not been done. · 尚未完成“设置”。)');
    return;
  }
  var ok = ui.alert(
    'Publish · 发布',
    'Publish the current content to the website? Both languages must be filled in. · 将当前内容发布到网站？中英文都必须填写。',
    ui.ButtonSet.OK_CANCEL
  );
  if (ok !== ui.Button.OK) return;
  var code;
  try {
    code = UrlFetchApp.fetch(hook, { method: 'post', muteHttpExceptions: true }).getResponseCode();
  } catch (e) {
    code = 0;
  }
  if (code >= 200 && code < 300) {
    ui.alert('Publishing started. The site updates in about two minutes. / 已开始发布，网站约两分钟后更新。');
  } else {
    ui.alert(failure + '\n\n(HTTP ' + code + ')');
  }
}
