import { getDatabase, onChildAdded, onChildRemoved, ref as fRef, update } from "firebase/database";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useUserStore } from "./user";

export const useGameListStore = defineStore('gameList', () => {
  const db = getDatabase();
  const userStore = useUserStore();
  const gameHeadersRef = fRef(db, 'gameList');

  const gameList: Ref<string[]> = ref([]);

  const isEmptyGameList = computed(() => gameList.value.length == 0);

  // #region Firebase Listeners
  onChildAdded(gameHeadersRef, (snapshot) => {
    if (snapshot.val() === userStore.user?.uid) {
      gameList.value.push(snapshot.key!);
    }
  });
  onChildRemoved(gameHeadersRef, (snapshot) => {
    const index = gameList.value.indexOf(snapshot.key!);
    if (index > -1) {
      gameList.value.splice(index, 1);
    }
  });
  // #endregion

  function deleteGame(gameIndex: number | string) {
    let gameCode: string;
    if (typeof gameIndex === 'number') {
      gameCode = gameList.value[gameIndex];
    } else {
      gameCode = gameIndex;
    }

    const rootRef = fRef(db);
    const updates: { [path: string]: any } = {};
    updates[`gameList/${gameCode}`] = null;
    updates[`gameData/${gameCode}`] = null;
    update(rootRef, updates);
  }

  return { gameList, isEmptyGameList, deleteGame };
});