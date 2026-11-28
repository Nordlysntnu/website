import { createServerFeature } from '@payloadcms/richtext-lexical'

/** Turns photos pasted, dropped or uploaded into the article text into Photo blocks (#169). */
export const PhotoBlocksFeature = createServerFeature({
  feature: { ClientFeature: '/components/editor/PhotoBlocksClient#PhotoBlocksClient' },
  key: 'nordlysPhotoBlocks',
})
