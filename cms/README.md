# 聖育幼兒園公告後台

這個資料夾是獨立的 Sanity Studio；公開網站仍維持在專案根目錄的靜態 HTML、CSS 與 JavaScript。

## 正式帳號完成後的設定

1. 在 `cms/` 複製 `.env.example` 為 `.env.local`。
2. 填入客戶 Sanity project 的 ID 與 dataset 名稱（預設為 `production`）。
3. 使用 Node.js 22.12 以上執行 `npm install`。
4. 使用 `npm run dev` 檢查後台，再以 `npm run deploy` 部署到 Sanity hosted Studio。
5. 將正式網站網址加入 Sanity 的 CORS Origins，前台唯讀即可，不開啟 Allow credentials。
6. 在根目錄 `js/sanity-config.js` 填入相同的 project ID。

## 客戶日常操作

- **新增公告**：建立新的「校園公告」文件，填完後按發布。
- **首頁顯示**：選擇「目前顯示在網站上」；首頁依優先顯示與公告日期，最多取四則。
- **保存舊資料**：將狀態改為「封存：只保留在後台」，不要刪除文件或附件。
- **附件**：第一版只接受 PDF；公開資料集中不可上傳含有兒童個資的文件。

## 安全界線

- `js/sanity-config.js` 可公開，僅放 project ID、dataset 與 API version。
- 不得在公開網站、Git 或 `.env.example` 放入 Sanity API token。
- `cms/.env.local` 已被忽略，不會提交到 Git。
