import { defineStore } from "pinia"
import { computed, ref, type Ref } from "vue"
import { useUserStore } from "./user"


export const useGameStore = defineStore('game', () => {
  const userStore = useUserStore();

  const admin: Ref<string | null> = ref(null)
  const gameStarted: Ref<boolean> = ref(false)
  const word: Ref<string | null> = ref(null)
  const players: Ref<{ [uid: string]: string }> = ref({})
  const whitePlayers: Ref<{ [uid: string]: boolean }> = ref({})

  const amIAdmin = computed(() => admin.value == userStore.user?.uid)

  return { admin, gameStarted, word, players, whitePlayers, amIAdmin }
})
  