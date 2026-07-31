import type {StructureResolver} from 'sanity/structure'

const currentFilter = '_type == "bulletin" && status == "active"'
const archiveFilter = '_type == "bulletin" && status == "archived"'
const ordering = [{field: 'publishedAt', direction: 'desc' as const}]

export const structure: StructureResolver = (S) =>
  S.list()
    .id('bulletin-root')
    .title('校園公告管理')
    .items([
      S.listItem()
        .id('bulletin-current')
        .title('目前顯示中')
        .schemaType('bulletin')
        .child(
          S.documentList()
            .id('bulletin-current-list')
            .title('目前顯示中')
            .schemaType('bulletin')
            .apiVersion('2026-07-29')
            .filter(currentFilter)
            .defaultOrdering(ordering),
        ),
      S.listItem()
        .id('bulletin-archive')
        .title('歷年封存公告')
        .schemaType('bulletin')
        .child(
          S.documentList()
            .id('bulletin-archive-list')
            .title('歷年封存公告')
            .schemaType('bulletin')
            .apiVersion('2026-07-29')
            .filter(archiveFilter)
            .defaultOrdering(ordering),
        ),
      S.divider(),
      S.listItem()
        .id('bulletin-all')
        .title('全部公告')
        .schemaType('bulletin')
        .child(S.documentTypeList('bulletin').id('bulletin-all-list').title('全部公告')),
    ])
