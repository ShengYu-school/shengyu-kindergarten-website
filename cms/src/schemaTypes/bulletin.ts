import {defineField, defineType} from 'sanity'

export const bulletin = defineType({
  name: 'bulletin',
  title: '校園公告',
  type: 'document',
  initialValue: () => ({
    status: 'active',
    isFeatured: false,
    publishedAt: new Date().toISOString(),
  }),
  fields: [
    defineField({
      name: 'title',
      title: '公告標題',
      type: 'string',
      description: '顯示在網站卡片上的主標題，建議 18 個中文字以內。',
      validation: (rule) => rule.required().max(36).warning('標題過長可能會讓網站卡片換行。'),
    }),
    defineField({
      name: 'category',
      title: '公告類別',
      type: 'string',
      options: {
        list: [
          {title: '行政公告', value: 'fees'},
          {title: '照護服務', value: 'medication'},
          {title: '校園安全', value: 'safety'},
          {title: '生活資訊', value: 'dailyRoutine'},
          {title: '其他公告', value: 'other'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'schoolYear',
      title: '學年度',
      type: 'string',
      description: '例如：115學年度。用於日後整理歷年公告。',
      validation: (rule) => rule.required().max(12),
    }),
    defineField({
      name: 'summary',
      title: '公告摘要',
      type: 'text',
      rows: 3,
      description: '顯示在網站卡片上的說明，建議 48 個中文字以內。',
      validation: (rule) => rule.required().max(110).warning('摘要過長可能會讓網站卡片顯得擁擠。'),
    }),
    defineField({
      name: 'attachment',
      title: '公告附件（PDF）',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      fields: [
        defineField({
          name: 'title',
          title: '附件顯示名稱',
          type: 'string',
          description: '選填；建議填寫家長容易理解的名稱。',
        }),
      ],
    }),
    defineField({
      name: 'externalUrl',
      title: '外部連結',
      type: 'url',
      description: '若公告要連到 Google 表單或其他公開網頁，可填寫此欄。附件與外部連結擇一即可。',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'buttonLabel',
      title: '按鈕文字',
      type: 'string',
      description: '選填；未填時，附件會顯示「下載公告」，連結會顯示「查看公告」。',
      validation: (rule) => rule.max(18),
    }),
    defineField({
      name: 'publishedAt',
      title: '公告日期',
      type: 'datetime',
      description: '新建公告時會自動填入；可依實際公告日期調整。',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isFeatured',
      title: '優先顯示在首頁',
      type: 'boolean',
      description: '首頁最多顯示四則公告；勾選後會優先出現在卡片區。',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      title: '網站顯示狀態',
      type: 'string',
      options: {
        list: [
          {title: '目前顯示在網站上', value: 'active'},
          {title: '封存：只保留在後台', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'schoolYear',
      status: 'status',
    },
    prepare({title, subtitle, status}) {
      return {
        title: title || '未命名公告',
        subtitle: `${subtitle || '未設定學年度'}・${status === 'archived' ? '已封存' : '網站顯示中'}`,
      }
    },
  },
})
