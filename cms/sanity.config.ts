import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID. Copy .env.example to .env.local and fill in the Sanity project ID.')
}

export default defineConfig({
  name: 'sun-you',
  title: '聖育幼兒園｜公告後台',
  projectId,
  dataset,
  plugins: [
    structureTool({
      title: '校園公告',
      structure,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    // 封存公告保有多年可查性；日常後台不提供刪除，避免誤把歷年文件與附件移除。
    actions: (previousActions, context) =>
      context.schemaType === 'bulletin'
        ? previousActions.filter((action) => action.action !== 'delete')
        : previousActions,
  },
})
