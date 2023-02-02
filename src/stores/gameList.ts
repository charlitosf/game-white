import { equalTo, getDatabase, onChildAdded, onChildRemoved, onValue, orderByValue, query, ref as fRef, update } from "firebase/database";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useUserStore } from "./user";

export const useGameListStore = defineStore('gameList', () => {
  const db = getDatabase();
  const userStore = useUserStore();
  const gameHeadersRef = fRef(db, 'gameList');
  const userGameRef = fRef(db, `userGame/${userStore.user?.uid}`);

  const guestGame: Ref<string | null> = ref(null);
  const adminGame: Ref<string | null> = ref(null);

  const isEmptyGameList = computed(() => guestGame.value === null && adminGame.value === null);
  const q = query(gameHeadersRef, orderByValue(), equalTo(userStore.user?.uid!));

  // #region Firebase Listeners
  onChildAdded(q, (snapshot) => {
    adminGame.value = snapshot.key;
  });
  onChildRemoved(q, () => {
    adminGame.value = null;
  });
  onValue(userGameRef, (snapshot) => {
    guestGame.value = snapshot.val();
  });
  // #endregion

  function deleteAdminGame() {
    const rootRef = fRef(db);
    const updates: { [path: string]: any } = {};
    updates[`gameList/${adminGame.value}`] = null;
    updates[`gameData/${adminGame.value}`] = null;
    update(rootRef, updates);
  }

  return { guestGame, adminGame, isEmptyGameList, deleteAdminGame };
});