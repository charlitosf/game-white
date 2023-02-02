import { generate4DigitRandomNumber } from "@/utils/utils";
import { getDatabase, child, onValue, onChildAdded, onChildRemoved, ref as fRef, update, runTransaction, set, get, type DatabaseReference } from "firebase/database";
import { defineStore } from "pinia"
import { computed, ref, watch, type Ref } from "vue"
import { useUserStore } from "./user"

export const useGameStore = defineStore('game', () => {
  const userStore = useUserStore();
  const db = getDatabase();

  const offGameFuncs: { (): void; }[] = [];
  const offWhitePlayersFuncs: { (): void; }[] = [];

  const gameId: Ref<string | null> = ref(null)
  const admin: Ref<string | null> = ref(null)
  const gameStarted: Ref<boolean> = ref(false)
  const word: Ref<string | null> = ref(null)
  const players: Ref<{ [uid: string]: string }> = ref({})
  const whitePlayers: Ref<{ [uid: string]: boolean }> = ref({})

  let gameDataRefPromiseResolve: (val: DatabaseReference | PromiseLike<DatabaseReference>) => void;
  let gameDataRef: DatabaseReference | Promise<DatabaseReference> = new Promise((r) => { gameDataRefPromiseResolve = r; });
  watch(gameId, (newGameId) => {
    if (newGameId === null) {
      gameDataRef = new Promise((r) => { gameDataRefPromiseResolve = r; });
      detachGame();
    } else {
      gameDataRefPromiseResolve(fRef(db, `gameData/${newGameId}`));
      attachGame();
    }
  });

  const amIAdmin = computed(() => admin.value == userStore.user?.uid)

  const generateRandomGameCode = async () => {
    const gameHeadersRef = fRef(db, 'gameList');
    const gameData = (await get(gameHeadersRef)).val();

    let gameCode: string = generate4DigitRandomNumber();
    if (gameData !== null) {
      const existingGames = Object.keys(gameData);
      while (existingGames.includes(gameCode)) {
        gameCode = generate4DigitRandomNumber();
      }
    }
    return gameCode;
  }

  async function createGame() {
    const gameHeadersRef = fRef(db, 'gameList');
    let gameCode: string;
    let retry = false;
    do {
      gameCode = await generateRandomGameCode();
      try {
        await set(child(gameHeadersRef, gameCode), userStore.user?.uid);
        retry = false;
      } catch (error) {
        retry = true;
      }
    } while (retry);

    const gameObject = {
      public: {
        admin: userStore.user?.uid,
        gameStarted: false,
      },
      word: '',
      // whitePlayers: { uid: true, }
    };

    gameId.value = gameCode;

    set(await gameDataRef, gameObject);
    return gameCode;
  }

  async function joinGame(id: string) {
    const gameRef = fRef(db, `gameData/${id}/public`);

    const admin = await get(child(gameRef, 'admin'));
    // Racing condition if game starts right here or admin is changed.
    // Purpousefully ignored as it is not game-breaker if a player joins an already started game and it should not change admin while the game is started
    // They will just never be white in the first round
    if (admin.val() === userStore.user?.uid) {
      gameId.value = id;
      return true;
    } else if ((await get(child(gameRef, 'gameStarted'))).val() === false) {
      const updateData: { [path: string]: any } = {};
      updateData[`gameData/${id}/public/participants/${userStore.user?.uid}`] = userStore.user?.email;
      updateData[`userGame/${userStore.user?.uid}`] = id;
      update(fRef(db), updateData);
      gameId.value = id;
      return true;
    }
    return false;
  }

  async function leaveGame(userId?: string) {
    userId = userId || userStore.user?.uid;

    const updates: { [path: string]: any } = {};
    updates[`gameData/${gameId.value}/public/participants/${userId}`] = null;
    updates[`gameData/${gameId.value}/whitePlayers/${userId}`] = null;
    updates[`userGame/${userId}`] = null;
    update(fRef(db), updates);

    if (userId === userStore.user?.uid) {
      gameId.value = null;
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
    updates[`userGame/${userStore.user?.uid}`] = gameId.value;
    updates[`userGame/${userId}`] = null;
    update(rootRef, updates);
  }

  async function startGame(word: string) {
    const updates: { [path: string]: any } = {};
    updates['public/gameStarted'] = true;
    updates['word'] = word;
    update(await gameDataRef, updates);
  }

  async function endGame() {
    const updates: { [path: string]: any } = {};
    updates['public/gameStarted'] = false;
    updates['word'] = '';
    update(await gameDataRef, updates);
  }

  async function toggleWhitePlayer(userId: string) {
    const whitePlayersRef = child(await gameDataRef, 'whitePlayers');
    runTransaction(child(whitePlayersRef, userId), (currentData) => {
      return currentData ? null : true;
    });
  }

  async function attachGame() {
    const participantsRef = child(await gameDataRef, 'public/participants');
    const whitesRef = child(await gameDataRef, 'whitePlayers');
    const gameStartedRef = child(await gameDataRef, `public/gameStarted`);
    const gameAdminRef = child(await gameDataRef, `public/admin`);

    offGameFuncs.push(onValue(gameAdminRef, (snapshot) => {
      const prevAdmin = admin.value;
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
      } else if (admin.value === null && prevAdmin === userStore.user?.uid) {
        detachGame();
      } else {
        offWhitePlayersFuncs.push(onValue(child(whitesRef, userStore.user?.uid!), (snapshot) => {
          whitePlayers.value[snapshot.key!] = snapshot.val() || null;
        }));
      }
    }));

    offGameFuncs.push(onValue(gameStartedRef, (snapshot) => {
      gameStarted.value = snapshot.val();
      if (gameStarted.value) {
        retrieveWord();
      }
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

    admin.value = null;
    gameStarted.value = false;
    players.value = {};
    whitePlayers.value = {};
    gameId.value = null;
  }

  async function retrieveWord() {
    try {
      word.value = (await get(child(await gameDataRef, 'word'))).val();
    } catch (e) {
      word.value = 'White :)';
    }
  }

  return { gameId, admin, gameStarted, word, players, whitePlayers, amIAdmin, createGame, startGame, endGame, makeAdmin, toggleWhitePlayer, joinGame, leaveGame }
})
