# 聖育幼兒園公告後台

這個資料夾是獨立的 Sanity Studio；公開網站仍維持在專案根目錄的靜態 HTML、CSS 與 JavaScript。

## 已完成的正式設定

- Studio：https://sunyou-bulletin.sanity.studio/
- Sanity project：`pbdgo643`
- Dataset：`production`（public）
- 前台來源：https://shengyu-school.github.io（CORS 不允許 credentials）
- 驗收網站：https://shengyu-school.github.io/shengyu-kindergarten-website/
- 本機開發需使用 Node.js 22.12 以上。
- 新專案目前是 Growth Trial；若沒有主動升級並加入付款資料，試用結束後會自動轉為 Free。
- 客戶驗收期間網站使用 `noindex, nofollow`；正式公開前需移除首頁的 robots meta。

需要修改後台欄位或介面時，在 `cms/` 執行：

1. `npm install`
2. `npm run dev`（本機檢查）
3. `npm run typecheck`
4. `npm run build`
5. `npm run deploy`（更新同一個正式 Studio）

## 客戶日常操作

- **進入後台**：直接開啟 Studio 網址並用受邀的 Sanity 帳號登入，建議加入瀏覽器書籤。
- **新增公告**：進入「校園公告」，按新增文件，填完後按「發布」。
- **首頁顯示**：選擇「目前顯示在網站上」；首頁依優先顯示與公告日期，最多取四則。
- **保存舊資料**：將狀態改為「封存：只保留在後台」，再按「發布」，不要刪除文件或附件。
- **附件**：第一版只接受 PDF；公開資料集中不可上傳含有兒童個資的文件。

建議第一次試用建立一則標題含「測試」的公告，發布後回到驗收網站重新整理；確認完成後改為封存並再次發布。

## 安全界線

- `js/sanity-config.js` 可公開，僅放 project ID、dataset 與 API version。
- 不得在公開網站、Git 或 `.env.example` 放入 Sanity API token。
- `cms/.env.local` 已被忽略，不會提交到 Git。
