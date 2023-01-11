import { generate4DigitRandomNumber } from "@/utils/utils";
import { getDatabase, child, onValue, onChildAdded, onChildRemoved, ref as fRef, update, runTransaction, set, get } from "firebase/database";
import { defineStore } from "pinia"
import { computed, ref, type Ref } from "vue"
import { useUserStore } from "./user"

export const useGameStore = defineStore('game', () => {
  const userStore = useUserStore();
  const db = getDatabase();

  const offGameFuncs: { (): void; }[] = [];
  const offWhitePlayersFuncs: { (): void; }[] = [];
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
    const gameHeadersRef = fRef(db, 'gameList');
    let gameCode: string = generate4DigitRandomNumber();
    await runTransaction(gameHeadersRef, (currentData) => {
      if (currentData === null) {
        return {
          [gameCode]: userStore.user?.uid,
        };
      } else {
        const existingGames = Object.keys(currentData);
        while (existingGames.includes(gameCode)) {
          gameCode = generate4DigitRandomNumber();
        }
        currentData[gameCode] = userStore.user?.uid;
        return currentData;
      }
    });
    const gameObject = {
      public: {
        admin: userStore.user?.uid,
        gameStarted: false,
      },
      word: '',
      // whitePlayers: { uid: true, }
    };
    const gameDataRef = fRef(db, `gameData/${gameCode}`);
    set(gameDataRef, gameObject);
    return gameCode;
  }

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

  async function joinGame(id: string) {
    const gameRef = fRef(db, `gameData/${id}/public`);

    const isGameStarted = (await get(child(gameRef, 'gameStarted'))).val();
    // Racing condition if game starts right here.
    // Purpousefully ignored as it is not game-breaker if a player joins an already started game
    // They will just never be white in the first round
    if (isGameStarted === false) {
      const admin = await get(child(gameRef, 'admin'));
      if (admin.val() !== userStore.user?.uid) {
        set(child(gameRef, `participants/${userStore.user?.uid}`), userStore.user?.email);
      }
      return true;
    }
    return false;
  }

  function leaveGame(userId?: string) {
    userId = userId || userStore.user?.uid;

    const gameRef = fRef(db, `gameData/${gameId.value!}/public`);

    set(child(gameRef, `participants/${userId}`), null);

    if (userId === userStore.user?.uid) {
      detachGame();
    }
  }

  // Transfer administrator privileges from current user to another user
  function makeAdmin(userId: string) {
    const rootRef = fRef(db);

    const updates: {[path: string]: any} = {};
    updates[`gameData/${gameId.value}/public/admin`] = userId;
    updates[`gameList/${gameId.value}`] = userId;
    updates[`gameData/${gameId.value}/public/participants/${userStore.user?.uid}`] = userStore.user?.email;
    updates[`gameData/${gameId.value}/public/participants/${userId}`] = null;
    updates[`gameData/${gameId.value}/whitePlayers/${userId}`] = null;
    update(rootRef, updates);
  }

  function startGame(word: string) {
    const gameRef = fRef(db, `gameData/${gameId.value!}`);

    const updates: { [path: string]: any } = {};
    updates['public/gameStarted'] = true;
    updates['word'] = word;
    update(gameRef, updates);
  }

  function endGame() {
    const gameRef = fRef(db, `gameData/${gameId.value!}`);

    const updates: { [path: string]: any } = {};
    updates['public/gameStarted'] = false;
    updates['word'] = '';
    update(gameRef, updates);
  }

  function toggleWhitePlayer(userId: string) {
    const whitePlayersRef = fRef(db, `gameData/${gameId.value!}/whitePlayers`);
    runTransaction(child(whitePlayersRef, userId), (currentData) => {
      return currentData ? null : true;
    });
  }

  function attachGame(id: string) {
    gameId.value = id;
    
    const gameRef = fRef(db, `gameData/${gameId.value}`);
    const participantsRef = child(gameRef, 'public/participants');
    const whitesRef = child(gameRef, 'whitePlayers');
    const gameStartedRef = child(gameRef, `public/gameStarted`);
    const gameAdminRef = child(gameRef, `public/admin`);
    const gameWordRef = child(gameRef, `word`);

    offGameFuncs.push(onValue(gameAdminRef, (snapshot) => {
      admin.value = snapshot.val();

      whitePlayers.value = {};
      offWhitePlayersFuncs.forEach((offFunc) => offFunc());
      offWhitePlayersFuncs.length = 0;
      
      if (admin.value === userStore.user?.uid) {
        offWhitePlayersFuncs.push(onChildAdded(whitesRef, (snapshot) => {
          whitePlayers.value[snapshot.key!] = true;
        }));
        offWhitePlayersFuncs.push(onChildRemoved(whitesRef, (snapshot) => {
          delete whitePlayers.value[snapshot.key!];
        }));
      } else {
        offWhitePlayersFuncs.push(onValue(child(whitesRef, userStore.user?.uid!), (snapshot) => {
          whitePlayers.value[snapshot.key!] = snapshot.val() || null;
        }));
      }
    }));

    offGameFuncs.push(onValue(gameStartedRef, (snapshot) => {
      gameStarted.value = snapshot.val();
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
  }

  function detachGame() {
    offGameFuncs.forEach((offFunc) => offFunc());
    offGameFuncs.length = 0;
    offWhitePlayersFuncs.forEach((offFunc) => offFunc());
    offWhitePlayersFuncs.length = 0;
    
    gameId.value = null;
    admin.value = null;
    gameStarted.value = false;
    word.value = null;
    players.value = {};
    whitePlayers.value = {};
  }

  function attachGameList() {
    const gameHeadersRef = fRef(db, 'gameList');

    offGameListFuncs.push(onChildAdded(gameHeadersRef, (snapshot) => {
      if (snapshot.val() === userStore.user?.uid) {
        gameList.value.push(snapshot.key!);
      }
    }));
      
    offGameListFuncs.push(onChildRemoved(gameHeadersRef, (snapshot) => {
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
  