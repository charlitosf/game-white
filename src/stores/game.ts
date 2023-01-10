import { generate4DigitRandomNumber } from "@/utils/utils";
import { getDatabase, child, onValue, onChildAdded, onChildRemoved, ref as fRef, update, runTransaction, set } from "firebase/database";
import { defineStore } from "pinia"
import { computed, ref, type Ref } from "vue"
import { useUserStore } from "./user"

export const useGameStore = defineStore('game', () => {
  const userStore = useUserStore();
  const db = getDatabase();

  const offGameFuncs: { (): void; }[] = [];
  const offGameListFuncs: { (): void; }[] = [];

  const gameId: Ref<string | null> = ref(null)
  const admin: Ref<string | null> = ref(null)
  const gameStarted: Ref<boolean> = ref(false)
  const word: Ref<string | null> = ref(null)
  const players: Ref<{ [uid: string]: string }> = ref({})
  const whitePlayers: Ref<{ [uid: string]: boolean }> = ref({})

  const gameList: Ref<string[]> = ref([])

  const amIAdmin = computed(() => admin.value == userStore.user?.uid)
  const isEmptyGameList = computed(() => gameList.value.length == 0)

  async function createGame() {
    const rootRef = fRef(db);
    let gameCode: string = generate4DigitRandomNumber();
    await runTransaction(rootRef, (currentData) => {
      const gameObject = {
        admin: userStore.user?.uid,
        gameStarted: false,
        word: '',
        // whitePlayers: { uid: true, }
      };

      if (currentData === null) {
        return {
          [gameCode]: gameObject,
        };
      } else {
        const existingGames = Object.keys(currentData);
        while (existingGames.includes(gameCode)) {
          gameCode = generate4DigitRandomNumber();
        }
        currentData[gameCode] = gameObject;
        return currentData;
      }
    });
    return gameCode;
  }

  function deleteGame(gameIndex: number | string) {
    let gameCode: string;
    if (typeof gameIndex === 'number') {
      gameCode = gameList.value[gameIndex];
    } else {
      gameCode = gameIndex;
    }

    const gameRef = fRef(db, gameCode);
    set(gameRef, null);
  }

  async function joinGame(id: string) {
    const gameRef = fRef(db, id);
    const result = await runTransaction(gameRef, (currentData) => {
      if (currentData === null) {
        return;
      } else if (currentData.admin === userStore.user?.uid) {
        return currentData;
      } else if (currentData.gameStarted) {
        return;
      } else if (currentData.admin !== userStore.user?.uid) {
        currentData.participants = { // Also works if participants is undefined
          ...currentData.participants,
          [userStore.user?.uid!]: userStore.user?.email,
        }
        return currentData;
      }
    });
    return result.committed;
  }

  function leaveGame(userId?: string) {
    userId = userId || userStore.user?.uid;

    const gameRef = fRef(db, gameId.value!);

    const updates: {[path: string]: any} = {};
    updates[`participants/${userId}`] = null;
    updates[`whitePlayers/${userId}`] = null;
    update(gameRef, updates);

    if (userId === userStore.user?.uid) {
      detachGame();
    }
  }

  // Transfer administrator privileges from current user to another user
  function makeAdmin(userId: string) {
    const gameRef = fRef(db, gameId.value!);

    const updates: {[path: string]: any} = {};
    updates['/admin'] = userId;
    updates[`/participants/${userStore.user?.uid}`] = userStore.user?.email;
    updates[`/participants/${userId}`] = null;
    update(gameRef, updates);
  }

  function startGame(word: string) {
    const gameRef = fRef(db, gameId.value!);

    const updates: { [path: string]: any } = {};
    updates['gameStarted'] = true;
    updates['word'] = word;
    update(gameRef, updates);
  }

  function endGame() {
    const gameRef = fRef(db, gameId.value!);

    const updates: { [path: string]: any } = {};
    updates['gameStarted'] = false;
    updates['word'] = '';
    update(gameRef, updates);
  }

  function toggleWhitePlayer(userId: string) {
    const gameRef = fRef(db, gameId.value!);
    runTransaction(child(gameRef, `whitePlayers/${userId}`), (currentData) => {
      return currentData ? null : true;
    });
  }

  function attachGame(id: string) {
    gameId.value = id;
    
    const gameRef = fRef(db, gameId.value);
    const participantsRef = child(gameRef, 'participants');
    const whitesRef = child(gameRef, 'whitePlayers');
    const gameStartedRef = child(gameRef, `gameStarted`);
    const gameAdminRef = child(gameRef, `admin`);
    const gameWordRef = child(gameRef, `word`);

    offGameFuncs.push(onValue(gameStartedRef, (snapshot) => {
      gameStarted.value = snapshot.val();
    }));
    offGameFuncs.push(onValue(gameAdminRef, (snapshot) => {
      admin.value = snapshot.val();
    }));
    offGameFuncs.push(onValue(gameWordRef, (snapshot) => {
      word.value = snapshot.val();
    }));

    offGameFuncs.push(onChildAdded(participantsRef, (snapshot) => {
      players.value[snapshot.key!] = snapshot.val();
    }));
    offGameFuncs.push(onChildRemoved(participantsRef, (snapshot) => {
      delete players.value[snapshot.key!];
      if (snapshot.key === userStore.user?.uid) {
        detachGame();
      }
    }));
    
    offGameFuncs.push(onChildAdded(whitesRef, (snapshot) => {
      whitePlayers.value[snapshot.key!] = true;
    }));
    offGameFuncs.push(onChildRemoved(whitesRef, (snapshot) => {
      delete whitePlayers.value[snapshot.key!];
    }));
  }

  function detachGame() {
    offGameFuncs.forEach((offFunc) => offFunc());
    offGameFuncs.length = 0;
    
    gameId.value = null;
    admin.value = null;
    gameStarted.value = false;
    word.value = null;
    players.value = {};
    whitePlayers.value = {};
  }

  function attachGameList() {
    const rootRef = fRef(db);

    offGameListFuncs.push(onChildAdded(rootRef, (snapshot) => {
      if (snapshot.val().admin === userStore.user?.uid) {
        gameList.value.push(snapshot.key!);
      }
    }));
      
    offGameListFuncs.push(onChildRemoved(rootRef, (snapshot) => {
      const index = gameList.value.indexOf(snapshot.key!);
      if (index > -1) {
        gameList.value.splice(index, 1);
      }
    }));
  }

  function detachGameList() {
    offGameListFuncs.forEach((offFunc) => offFunc());
    offGameListFuncs.length = 0;

    gameList.value = [];
  }

  return { gameId, admin, gameStarted, word, players, whitePlayers, gameList, amIAdmin, isEmptyGameList, attachGame, detachGame, attachGameList, detachGameList, createGame, deleteGame, startGame, endGame, makeAdmin, toggleWhitePlayer, joinGame, leaveGame }
})
  