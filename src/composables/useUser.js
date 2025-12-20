import { ref } from 'vue'
import { getOrCreateUserWithScores, upsertScore, updateUserAlerts } from '../api/api'

const loading = ref(false)
const user = ref({ scores: [] })

const getUser = async (initData) => {
  try {
    loading.value = true
    console.log('getUser')
    const res = await getOrCreateUserWithScores(initData)
    user.value = res
    console.log('user', user.value)
  } catch (error) {
    console.error('Не удалось получить данные пользователя:', error.message)
    throw error
  } finally {
    loading.value = false
  }
}

const userScoreForChapterAndMode = (chapter_id, mode_id) => {
  return (
    (user.value?.scores || []).find(
      (score) => score.chapter_id === chapter_id && score.mode_id === mode_id
    ) || null
  )
}

const updateScores = async (chapter_id, mode_id, score) => {
  if (!user.value?.uuid) {
    throw new Error('User is not loaded yet')
  }

  try {
    loading.value = true
    user.value.scores = await upsertScore({
      uuid: user.value.uuid,
      chapter_id,
      mode_id,
      score,
    })
  } catch (error) {
    console.error('Не удалось обновить результат:', error.message)
  } finally {
    loading.value = false
  }
}

const setUserAlerts = async (alerts) => {
  if (!user.value?.uuid) {
    throw new Error('User is not loaded yet')
  }

  try {
    loading.value = true
    const updated = await updateUserAlerts(user.value.uuid, alerts)
    user.value = updated
  } catch (error) {
    console.error('Не удалось обновить настройки уведомлений:', error.message)
    throw error
  } finally {
    loading.value = false
  }
}

export function useUser() {
  return {
    user,
    loading,
    userScoreForChapterAndMode,
    getUser,
    updateScores,
    setUserAlerts,
  }
}
