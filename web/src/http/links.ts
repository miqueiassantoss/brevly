import { api } from './api'

export interface Link {
  id: string
  originalUrl: string
  shortenedUrl: string
  accessCount: number
  createdAt: string
}

export async function getLinks(): Promise<Link[]> {
  const { data } = await api.get<Link[]>('/links')
  return data
}

export async function createLink(payload: {
  originalUrl: string
  shortenedUrl: string
}): Promise<Link> {
  const { data } = await api.post<Link>('/links', {
    original_url: payload.originalUrl,
    shortened_url: payload.shortenedUrl,
  })
  return data
}

export async function deleteLink(id: string): Promise<void> {
  await api.delete(`/links/${id}`)
}

export async function exportLinks(): Promise<{ downloadUrl: string }> {
  const { data } = await api.get<{ downloadUrl: string }>('/links/export')
  return data
}
