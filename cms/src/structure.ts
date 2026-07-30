import type {StructureResolver} from 'sanity/structure'

const currentFilter = '_type == "bulletin" && status == "active"'
const archiveFilter = '_type == "bulletin" && status == "archived"'
const ordering = [{field: 'publishedAt', direction: 'desc' as const}]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('校園公告管理')
    .items([
      S.listItem()
        .title('目前顯示中')
        .schemaType('bulletin')
        .child(
          S.documentList()
            .title('目前顯示中')
            .schemaType('bulletin')
            .filter(currentFilter)
            .defaultOrdering(ordering),
        ),
      S.listItem()
        .title('歷年封存公告')
        .schemaType('bulletin')
        .child(
          S.documentList()
            .title('歷年封存公告')
            .schemaType('bulletin')
            .filter(archiveFilter)
            .defaultOrdering(ordering),
        ),
      S.divider(),
      S.listItem()
        .title('全部公告')
        .schemaType('bulletin')
        .child(S.documentTypeList('bulletin').title('全部公告')),
    ])
