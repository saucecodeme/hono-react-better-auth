import { useMutation, useQueryClient } from '@tanstack/react-query'
import { hc } from 'hono/client'
import type { AppType } from '../../../../server'
import type {
  CreateTodo,
  PatchTodo,
  CreateTag,
  PatchTag,
} from '../../../../server/types'

const client = hc<AppType>('/')

// Example
// function useCreateUser() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async (newUser: { name: string }) => {
//       const res = await fetch('/api/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newUser),
//       })
//       return res.json()
//     },
//     onSuccess: () => {
//       // invalidate queries so GET data updates automatically
//       queryClient.invalidateQueries({ queryKey: ['users'] })
//     },
//   })
// }

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newTodo: CreateTodo) => {
      const res = await client.api.todos.$post({ json: newTodo })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function usePatchTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatchTodo }) => {
      const res = await client.api.todos[':id'].$patch({
        param: { id },
        json: data,
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.todos[':id'].$delete({
        param: { id },
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// * Tags
export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newTag: CreateTag) => {
      const res = await client.api.tags.$post({ json: newTag })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function usePatchTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatchTag }) => {
      const res = await client.api.tags[':id'].$patch({
        param: { id },
        json: data,
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.tags[':id'].$delete({
        param: { id },
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}
