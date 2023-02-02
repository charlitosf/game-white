import { getDatabase, onChildAdded, onChildRemoved, ref as fRef, update } from "firebase/database";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useUserStore } from "./user";

export const useGameListStore = defineStore('gameList', () => {
  const db = getDatabase();
  const userStore = useUserStore();
  const gameHeadersRef = fRef(db, 'gameList');

  const gameList: Ref<Set<string>> = ref(new Set<string>());

  const isEmptyGameList = computed(() => gameList.value.size == 0);

  // #region Firebase Listeners
  onChildAdded(gameHeadersRef, (snapshot) => {
    if (snapshot.val() === userStore.user?.uid) {
      gameList.value.add(snapshot.key!);
    }
  });
  onChildRemoved(gameHeadersRef, (snapshot) => {
    gameList.value.delete(snapshot.key!);
  });
  // #endregion

  function deleteGame(gameCode: string) {
    const rootRef = fRef(db);
    const updates: { [path: string]: any } = {};
    updates[`gameList/${gameCode}`] = null;
    updates[`gameData/${gameCode}`] = null;
    update(rootRef, updates);
  }

  return { gameList, isEmptyGameList, deleteGame };
});