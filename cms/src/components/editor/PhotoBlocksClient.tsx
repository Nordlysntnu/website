'use client'
import { useEffect } from 'react'
import { $createBlockNode, UploadNode, createClientFeature } from '@payloadcms/richtext-lexical/client'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $nodesOfType } from '@payloadcms/richtext-lexical/lexical'

// Photos pasted, dropped or inserted with Payload's Upload button arrive as upload nodes, which the
// editor shows as small cards. This turns each finished upload into a Photo block, which the editor
// shows at its real size and position (#169). Photos already in an article when it is opened are
// left as they are, so opening an article never changes it by itself.

const blockID = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) => byte.toString(16).padStart(2, '0')).join('')

function UploadsToPhotoBlocks() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    const existing = new Set(editor.getEditorState().read(() => $nodesOfType(UploadNode).map((node) => node.getKey())))
    return editor.registerNodeTransform(UploadNode, (node) => {
      if (existing.has(node.getKey())) return
      const data = node.getData() as { relationTo?: string; value?: unknown; pending?: unknown; fields?: { caption?: string; layout?: string } }
      // Wait until a pasted or dropped file has finished uploading.
      if (data.pending || data.relationTo !== 'media') return
      const raw = data.value && typeof data.value === 'object' && 'id' in data.value ? (data.value as { id: unknown }).id : data.value
      if (typeof raw !== 'number' && !(typeof raw === 'string' && /^\d+$/.test(raw))) return
      node.replace($createBlockNode({ id: blockID(), blockName: '', blockType: 'photo', image: Number(raw),
        layout: data.fields?.layout || 'normal', caption: data.fields?.caption || '' } as never))
    })
  }, [editor])
  return null
}

export const PhotoBlocksClient = createClientFeature({ plugins: [{ Component: UploadsToPhotoBlocks, position: 'normal' }] })
