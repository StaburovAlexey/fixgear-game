const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const defaultHeaders = {
  'Content-Type': 'application/json',
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message
    throw new Error(message || `API error ${response.status}`)
  }

  return data
}

export async function getOrCreateUserWithScores(initData) {
  const payload = initData || import.meta.env.VITE_DEV_INIT_DATA

  if (!payload) {
    throw new Error('Telegram initData is required to authenticate user')
  }

  return request('/auth/telegram', {
    method: 'POST',
    body: JSON.stringify({ initData: payload }),
  })
}

export async function getScoresByUserUuid(uuid) {
  const user = await request(`/users/${uuid}`)
  return user?.scores || []
}

export async function upsertScore({ uuid, chapter_id, mode_id, score }) {
  return request('/scores', {
    method: 'PUT',
    body: JSON.stringify({
      uuid,
      chapter_id,
      mode_id,
      score,
    }),
  })
}

export async function getScoresByChapterAndMode(chapter_id, mode_id) {
  const query = new URLSearchParams({
    chapter_id: chapter_id?.toString(),
    mode_id: mode_id?.toString(),
  }).toString()

  return request(`/scores?${query}`)
}

export async function updateUserAlerts(uuid, alerts) {
  return request(`/users/${uuid}/alerts`, {
    method: 'PATCH',
    body: JSON.stringify({ alerts }),
  })
}
