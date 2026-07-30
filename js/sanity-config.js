/*
 * 公開網站的 Sanity 設定。
 *
 * 正式串接時只需填入 projectId；這個檔案可以公開，絕對不要放入任何
 * API token、帳密或其他私密資訊。資料集僅存放準備公開的園務公告。
 */
window.SUN_YOU_SANITY_CONFIG = Object.freeze({
  projectId: '',
  dataset: 'production',
  apiVersion: '2026-07-29',
});
