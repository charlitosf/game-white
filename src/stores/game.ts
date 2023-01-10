import { getDatabase, child, onValue, onChildAdded, onChildRemoved, ref as fRef, update } from "firebase/database";
import { defineStore } from "pinia"
import { computed, ref, type Ref } from "vue"
import { useUserStore } from "./user"

export const useGameStore = defineStore('game', () => {
  const userStore = useUserStore();
  const db = getDatabase();

  const offFuncs: { (): void; }[] = [];

  const gameId: Ref<string | null> = ref(null)
  const admin: Ref<string | null> = ref(null)
  const gameStarted: Ref<boolean> = ref(false)
  const word: Ref<string | null> = ref(null)
  const players: Ref<{ [uid: string]: string }> = ref({})
  const whitePlayers: Ref<{ [uid: string]: boolean }> = ref({})


  const amIAdmin = computed(() => admin.value == userStore.user?.uid)

  function leaveGame() {
    const gameRef = fRef(db, gameId.value!);
    const updates: {[path: string]: any} = {};
    updates[`participants/${userStore.user?.uid}`] = null;
    updates[`whitePlayers/${userStore.user?.uid}`] = null;
    update(gameRef, updates);
    detachGame();
  }

  function attachGame(id: string) {
    gameId.value = id;
    
    const gameRef = fRef(db, gameId.value);
    const participantsRef = child(gameRef, 'participants');
    const whitesRef = child(gameRef, 'whitePlayers');
    const gameStartedRef = child(gameRef, `gameStarted`);
    const gameAdminRef = child(gameRef, `admin`);
    
    offFuncs.push(onValue(gameStartedRef, (snapshot) => {
      gameStarted.value = snapshot.val();
    }));
    offFuncs.push(onValue(gameAdminRef, (snapshot) => {
      admin.value = snapshot.val();
    }));
    offFuncs.push(onValue(child(gameRef, `word`), (snapshot) => {
      word.value = snapshot.val();
    }));
    offFuncs.push(onChildAdded(participantsRef, (snapshot) => {
      players.value[snapshot.key!] = snapshot.val();
    }));
    offFuncs.push(onChildRemoved(participantsRef, (snapshot) => {
      delete players.value[snapshot.key!];
      if (snapshot.key === userStore.user?.uid) {
        detachGame();
      }
    }));
    offFuncs.push(onChildAdded(whitesRef, (snapshot) => {
      whitePlayers.value[snapshot.key!] = true;
    }));
    offFuncs.push(onChildRemoved(whitesRef, (snapshot) => {
      delete whitePlayers.value[snapshot.key!];
    }));
  }

  function detachGame() {
    offFuncs.forEach((offFunc) => offFunc());
    offFuncs.length = 0;
    
    gameId.value = null;
    admin.value = null;
    gameStarted.value = false;
    word.value = null;
    players.value = {};
    whitePlayers.value = {};
  }

  return { gameId, admin, gameStarted, word, players, whitePlayers, amIAdmin, attachGame, detachGame, leaveGame }
})
  