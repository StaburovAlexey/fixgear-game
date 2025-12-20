<script setup>
  import { ref, onMounted, onBeforeUnmount, reactive, computed } from 'vue'
  import GameContainer from './components/game/GameContainer.vue'
  import MenuComponent from './components/MenuComponent.vue'
  import LeaderboardComponent from './components/leaderboard/LeaderboardComponent.vue'
  import SaveResultComponent from './components/SaveResultComponent.vue'
  import OrientationGuard from './components/OrientationGuard.vue'
  import ChangeChapter from './components/ChangeChapter.vue'
  import SoundToggle from './components/SoundToggle.vue'
  import PreloaderComponent from './components/PreloaderComponent.vue'
  import GameOverComponent from './components/GameOverComponent.vue'
  import { preloadAssets } from './pixi/assets'
  import { useUser } from './composables/useUser'
  import { useLeaderboardStore } from './composables/useLeaderboardStore'

  const { user, getUser, updateScores, userScoreForChapterAndMode } = useUser()
  const { updateLeaderboard } = useLeaderboardStore()

  const showOverlay = ref(false)
  const gameChapter = reactive({})
  const gameStatus = ref('Main-menu')
  const isSurpassed = ref(false)
  // Компоненты по статусу
  const componentsMap = {
    'Main-menu': MenuComponent,
    'Loading-menu': MenuComponent,
    Leaderboard: LeaderboardComponent,
    'Save-result': SaveResultComponent,
    'Game-over': GameOverComponent,
    'Finish-game': GameOverComponent,
    'Change-chapter': ChangeChapter,
    'Start-game': GameContainer,
  }

  const currentComponent = computed(() => componentsMap[gameStatus.value] || null)

  onMounted(async () => {
    gameStatus.value = 'Loading-menu' // или 'Loading-menu', если нужно показать загрузку
    const tg = window.Telegram?.WebApp
    const initData = tg?.initData || import.meta.env.VITE_DEV_INIT_DATA

    tg?.ready()
    tg?.expand()
    tg?.BackButton?.hide()

    await preloadAssets()
    try {
      await getUser(initData)
    } catch (error) {
      console.error('Не удалось инициализировать пользователя', error)
    }

    gameStatus.value = 'Main-menu'

    checkOrientation()
    window.addEventListener('orientationchange', checkOrientation)
    window.addEventListener('resize', checkOrientation)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('orientationchange', checkOrientation)
    window.removeEventListener('resize', checkOrientation)
  })

  function checkOrientation() {
    showOverlay.value = !window.matchMedia('(orientation: landscape)').matches
  }

  async function gameOver(gStatus, score) {
    isSurpassed.value = false
    const chapterId = gameChapter.value.chapter_id
    const modeId = gameChapter.value.mode
    const normalizedScore = Math.floor(score)

    try {
      const userScore = userScoreForChapterAndMode(chapterId, modeId)?.score
      if (user.value?.uuid && (!userScore || userScore < normalizedScore)) {
        await updateScores(chapterId, modeId, normalizedScore)
        isSurpassed.value = true
      }
    } catch (error) {
      console.error('Не удалось сохранить результат', error)
    }

    try {
      await updateLeaderboard(chapterId, modeId)
    } catch (error) {
      console.error('Не удалось обновить таблицу лидеров', error)
    }

    gameStatus.value = gStatus
  }

  function changeGameStatus(value) {
    gameStatus.value = value
  }

  function playChapter(chapter) {
    gameStatus.value = 'Start-game'
    gameChapter.value = chapter
  }
</script>

<template>
  <div class="safe-area">
    <OrientationGuard @orientation-changed="changeGameStatus" />
    <component
      :is="currentComponent"
      v-if="currentComponent"
      :game-status="gameStatus"
      :game-chapter="gameChapter"
      :user-id="user?.uuid"
      :is-surpassed="isSurpassed"
      @exit-menu="gameStatus = 'Main-menu'"
      @start-game="gameStatus = 'Start-game'"
      @change-chapter="gameStatus = 'Change-chapter'"
      @liderboard="gameStatus = 'Leaderboard'"
      @save-result="gameStatus = 'Save-result'"
      @play-chapter="playChapter"
      @back-click="gameStatus = 'Main-menu'"
      @game-over="gameOver"
    />

    <SoundToggle :gameStatus="gameStatus" />
    <PreloaderComponent v-if="gameStatus === 'Loading-menu'" text="Загрузка..." />
  </div>
</template>

<style scoped>
  .game-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1e1e1e;
    font-size: 24px;
    color: #333;
  }

  .safe-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    background-color: transparent;
    padding-top: var(--tg-safe-area-inset-top);
    box-sizing: border-box;
  }
</style>
