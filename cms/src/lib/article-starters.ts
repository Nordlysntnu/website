const text = (value: string) => ({ type: 'text', version: 1, text: value, detail: 0, format: 0, mode: 'normal', style: '' })
const paragraph = (value: string) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [text(value)] })
const heading = (value: string) => ({ type: 'heading', tag: 'h2', version: 1, direction: 'ltr', format: '', indent: 0, children: [text(value)] })

export const articleStarters = [
  { id: 'update', name: 'Team update', description: 'Share progress from your group or the workshop.',
    sections: ['What we have been working on', 'What we learned', 'What comes next'] },
  { id: 'race', name: 'Race report', description: 'Tell the story of a competition or a test day.',
    sections: ['On the track', 'Results and lessons', 'Thank you and next steps'] },
  { id: 'partner', name: 'Partner story', description: 'Introduce a partner and the work they support.',
    sections: ['Meet our partner', 'What we are building together', 'Why their support matters'] },
] as const

export function starterData(id: string) {
  const starter = articleStarters.find((item) => item.id === id)
  if (!starter) throw new Error('Unknown article starter.')
  return {
    title: '[Write your headline]',
    content: { root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
      children: starter.sections.flatMap((section) => [heading(section), paragraph(`[Write about ${section.toLowerCase()}]`)]),
    } },
    department: 'Team', review: 'writing', _status: 'draft',
  }
}
