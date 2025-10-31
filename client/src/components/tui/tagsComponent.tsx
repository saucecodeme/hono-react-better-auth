import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input as TInput } from '@/components/tui/input'
import { Tag, CirclePlus } from 'lucide-react'
import {
  createTagSchema,
  patchTagSchema,
  type TagQuery,
  type CreateTag,
} from '../../../../server/types'
import { triggerToast } from '@/utils/sonner/triggerToast'
import z from 'zod'
import {
  useCreateTag,
  usePatchTag,
  useDeleteTag,
} from '@/utils/tanstack-query/useMutation'
import { generateRandomHexColor } from '@/utils'

export const TagsComponent = ({
  tags,
  onTagClick,
}: {
  tags: TagQuery[]
  onTagClick?: (tagId: string) => void
}) => {
  const tagMap = React.useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag])),
    [tags]
  )

  const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)
  const editingTagRef = React.useRef<HTMLInputElement>(null)

  const [editingTagId, setEditingTagId] = React.useState<string | null>(null)
  const [editingTag, setEditingTag] = React.useState<TagQuery | null>(null)

  const createTag = useCreateTag()
  const patchTag = usePatchTag()
  const deleteTag = useDeleteTag()

  const clearPendingClick = React.useEffectEvent(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
  })

  React.useEffect(() => {
    return () => clearPendingClick()
  }, [clearPendingClick])

  const handleInitNewTag = () => {
    const blankTag: CreateTag = {
      name: 'New tag',
      colorHex: generateRandomHexColor(),
    }
    createTag.mutate(blankTag, {
      onError: (mutationError) => {
        triggerToast(
          'error',
          mutationError instanceof Error
            ? mutationError.message
            : 'Failed to create tag'
        )
      },
    })
  }

  const handleEditTag = (id: string) => {
    const tag = tagMap.get(id)
    if (!tag) return
    setEditingTagId(id)
    setEditingTag(tag)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.currentTarget.value
    setEditingTag((prev) => ({ ...(prev as TagQuery), name }))
  }

  const handleEditCancel = () => {
    setEditingTagId(null)
    setEditingTag(null)
  }

  const handleEditCommit = () => {
    if (!editingTag || !editingTagId) return
    const newTagName = editingTag.name.trim()
    console.log('newTagName:', newTagName)
    const tag = tagMap.get(editingTagId)
    if (!tag || tag.name === newTagName) {
      handleEditCancel()
      return
    }

    // Delete tag
    if (!newTagName) {
      deleteTag.mutate(editingTag.id, {
        onError: (mutationError) => {
          triggerToast(
            'error',
            mutationError instanceof Error
              ? mutationError.message
              : 'Failed to delete tag'
          )
        },
      })
      handleEditCancel()
      return
    }

    const parsed = patchTagSchema.safeParse({
      name: newTagName,
    })
    if (parsed.error) {
      triggerToast(
        'error',
        z.treeifyError(parsed.error).errors[0] ?? 'Invalid input'
      )
      return
    }
    patchTag.mutate(
      { id: editingTagId, data: parsed.data },
      {
        onError: (muataionError) => {
          triggerToast(
            'error',
            muataionError instanceof Error
              ? muataionError.message
              : 'Failed to update tag'
          )
        },
      }
    )

    handleEditCancel()
  }

  const handleEditInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEditCommit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleEditCancel()
    }
  }

  const handleLoseFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) handleEditCancel()
  }

  const handleTagClick = (id: string) => {
    clearPendingClick()

    clickTimeoutRef.current = setTimeout(() => {
      // Add tag to todo
      if (onTagClick) {
        onTagClick(id)
      }
    }, 200)
  }

  const handleTagDoubleClick = (id: string) => {
    clearPendingClick()
    handleEditTag(id)
  }

  React.useEffect(() => {
    if (!editingTagId) return
    const frame = requestAnimationFrame(() => {
      editingTagRef.current?.focus()
      editingTagRef.current?.select()
    })
    return () => cancelAnimationFrame(frame)
  }, [editingTagId])

  return (
    <div className="w-[300px] p-4 flex flex-row items-start justify-start flex-wrap gap-2 rounded-lg">
      {tags.map((tag) => (
        <motion.div
          key={tag.id}
          style={{ backgroundColor: `${tag.colorHex}70` }}
          className="px-2 py-1 flex flex-row gap-1 items-center rounded-lg text-xs"
          onClick={() => handleTagClick(tag.id)}
          onDoubleClick={() => handleTagDoubleClick(tag.id)}
          animate={{
            scale: editingTagId === tag.id ? 1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Tag size={10} strokeWidth={3} />
          {editingTagId === tag.id && editingTag ? (
            <TInput
              ref={editingTagRef}
              id={`tag-${tag.id}`}
              name="name"
              variant="plain"
              type="text"
              className="text-xs"
              defaultValue={editingTag.name}
              style={{ width: `${editingTag.name.length + 1}ch` }}
              onChange={handleEditInputChange}
              onKeyDown={handleEditInputKeyDown}
              onBlur={handleLoseFocus}
            />
          ) : (
            <span>{tag.name}</span>
          )}
        </motion.div>
      ))}
      <div
        className="px-2 py-1 shrink-0 flex flex-row gap-1 justify-center items-center rounded-lg text-xs hover:bg-s-foreground-dark/50"
        onClick={() => handleInitNewTag()}
      >
        <CirclePlus size={10} strokeWidth={3} />
        <span>New tag</span>
      </div>
    </div>
  )
}
