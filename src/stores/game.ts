import {
  getDatabase,
  child,
  onValue,
  onChildAdded,
  onChildRemoved,
  ref as fRef,
  update,
  runTransaction,
  get,
  type DatabaseReference,
  DataSnapshot,
} from "firebase/database";
import { defineStore } from "pinia";
import { computed, ref, watch, type Ref } from "vue";
import { useUserStore } from "./user";
import { generate4DigitRandomNumber } from "../utils/utils";
import { useRouter } from "vue-router";

export const useGameStore = defineStore("game", () => {
  // #region Dependencies
  const userStore = useUserStore();
  const db = getDatabase();
  const router = useRouter();
  // #endregion

  // #region State
  const offGameFuncs: (() => void)[] = [];
  const offWhitePlayersFuncs: (() => void)[] = [];

  const gameId: Ref<string | null> = ref(null);

  const admin: Ref<string | null> = ref(null);
  const gameStarted: Ref<boolean> = ref(false);
  const word: Ref<string | null> = ref(null);
  const players: Ref<Map<string, string>> = ref(new Map());
  const whitePlayers: Ref<Map<string, boolean>> = ref(new Map());
  // #endregion

  // #region Watchers
  let previousUnsubscribe: (() => void) | null = null;
  let userGameRef: DatabaseReference | null = null;
  watch(userStore, (userStoreChanged) => {
    userGameRef = fRef(db, `userGame/${userStoreChanged.user?.uid}`);
    if (previousUnsubscribe) {
      previousUnsubscribe();
    }
    previousUnsubscribe = onValue(userGameRef, (snapshot) => {
      gameId.value = snapshot.val();
    });
  });

  let gameDataRef: DatabaseReference | null = null;
  watch(gameId, (newGameId) => {
    if (newGameId === null) {
      gameDataRef = null;
      detachGame();
      router.replace({ name: "home" });
    } else {
      gameDataRef = fRef(db, `gameData/${newGameId}`);
      attachGame();
      router.replace({ name: "lobby" });
    }
  });
  // #endregion

  // #region Computed properties
  const alreadyBelongsToAGame = computed(() => gameId.value !== null);
  const amIAdmin = computed(() => admin.value == userStore.user?.uid);
  // #endregion

  // #region Methods
  async function createGame() {
    let gameCode: string;
    let game: DataSnapshot | null = null;
    do {
      gameCode = generate4DigitRandomNumber();

      try {
        game = await get(fRef(db, `gameList/${gameCode}/public/admin`));
      } catch {
        game = null;
      }
    } while (game !== null);

    const updates: Record<string, unknown> = {};

    updates[`gameData/${gameCode}`] = {
      public: {
        admin: userStore.user?.uid,
        gameStarted: false,
      },
      word: "",
    };
    updates[`userGame/${userStore.user?.uid}`] = gameCode;
    gameId.value = gameCode;

    await update(fRef(db), updates);
    return gameCode;
  }

  async function deleteGame(id?: string) {
    if (id === undefined) {
      if (gameId.value === null) {
        return;
      }
      id = gameId.value;
    }
    const rootRef = fRef(db);
    const updates: Record<string, unknown> = {};
    const players = (
      await get(child(rootRef, `gameData/${id}/public/participants`))
    ).val();
    if (players !== null) {
      for (const player of Object.keys(players)) {
        updates[`userGame/${player}`] = null;
      }
    }
    updates[`userGame/${userStore.user?.uid}`] = null;
    updates[`gameData/${id}`] = null;
    update(rootRef, updates);
    gameId.value = null;
  }

  async function joinGame(id: string) {
    const gameRef = fRef(db, `gameData/${id}/public`);

    const admin = await get(child(gameRef, "admin"));
    // Racing condition if game starts right here or admin is changed.
    // Purpousefully ignored as it is not game-breaker if a player joins an already started game and it should not change admin while the game is started
    // They will just never be white in the first round
    if (admin.val() === userStore.user?.uid) {
      gameId.value = id;
      return true;
    } else if ((await get(child(gameRef, "gameStarted"))).val() === false) {
      const updateData: Record<string, unknown> = {};
      updateData[`gameData/${id}/public/participants/${userStore.user?.uid}`] =
        userStore.user?.displayName;

      updateData[`userGame/${userStore.user?.uid}`] = id;
      update(fRef(db), updateData);
      gameId.value = id;
      return true;
    }
    return false;
  }

  async function leaveGame(userId?: string) {
    userId = userId ?? userStore.user?.uid;

    const admin = await get(fRef(db, `gameData/${gameId.value}/public/admin`));

    if (admin.val() === userId) {
      // Can't leave if you are the admin
      return;
    }

    const updates: Record<string, unknown> = {};
    updates[`gameData/${gameId.value}/public/participants/${userId}`] = null;
    updates[`gameData/${gameId.value}/whitePlayers/${userId}`] = null;
    updates[`userGame/${userId}`] = null;
    await update(fRef(db), updates);
  }

  // Transfer administrator privileges from current user to another user (randomly if not provided)
  function makeAdmin(userId: string | null = null) {
    if (userId === null) {
      const participants = Array.from(players.value.keys());
      if (participants.length === 0) {
        return;
      }
      userId = participants[Math.floor(Math.random() * participants.length)];
    }
    const rootRef = fRef(db);

    const updates: Record<string, unknown> = {};
    updates[`gameData/${gameId.value}/public/admin`] = userId;
    updates[
      `gameData/${gameId.value}/public/participants/${userStore.user?.uid}`
    ] = userStore.user?.displayName;
    updates[`gameData/${gameId.value}/public/participants/${userId}`] = null;
    updates[`gameData/${gameId.value}/whitePlayers/${userId}`] = null;
    update(rootRef, updates);
  }

  async function startGame(word: string) {
    if (gameDataRef === null) {
      return;
    }

    const updates: Record<string, unknown> = {};
    updates["public/gameStarted"] = true;
    updates["word"] = word;
    update(gameDataRef, updates);
  }

  async function endGame() {
    if (gameDataRef === null) {
      return;
    }

    const updates: Record<string, unknown> = {};
    updates["public/gameStarted"] = false;
    updates["word"] = "";
    update(gameDataRef, updates);
  }

  async function toggleWhitePlayer(userId: string) {
    if (gameDataRef === null) {
      return;
    }

    const whitePlayersRef = child(gameDataRef, "whitePlayers");
    runTransaction(child(whitePlayersRef, userId), (currentData) => {
      return currentData ? null : true;
    });
  }

  async function retrieveWord() {
    if (gameDataRef === null) {
      return;
    }

    try {
      word.value = (await get(child(gameDataRef, "word"))).val();
    } catch {
      word.value = "White :)";
    }
  }
  // #endregion

  // #region Game attachment/detachment
  async function attachGame() {
    if (gameDataRef === null) {
      return;
    }

    const participantsRef = child(gameDataRef, "public/participants");
    const whitesRef = child(gameDataRef, "whitePlayers");
    const gameStartedRef = child(gameDataRef, `public/gameStarted`);
    const gameAdminRef = child(gameDataRef, `public/admin`);

    offGameFuncs.push(
      onValue(gameAdminRef, (snapshot) => {
        const prevAdmin = admin.value;
        admin.value = snapshot.val();

        whitePlayers.value.clear();
        offWhitePlayersFuncs.forEach((offFunc) => offFunc());
        offWhitePlayersFuncs.length = 0;

        if (admin.value === userStore.user?.uid) {
          offWhitePlayersFuncs.push(
            onChildAdded(whitesRef, (snapshot) => {
              if (snapshot.key) {
                whitePlayers.value.set(snapshot.key, true);
              }
            })
          );
          offWhitePlayersFuncs.push(
            onChildRemoved(whitesRef, (snapshot) => {
              if (snapshot.key) {
                whitePlayers.value.delete(snapshot.key);
              }
            })
          );
        } else if (admin.value === null && prevAdmin === userStore.user?.uid) {
          detachGame();
        } else if (userStore.user?.uid) {
          offWhitePlayersFuncs.push(
            onValue(child(whitesRef, userStore.user?.uid), (snapshot) => {
              if (snapshot.key) {
                whitePlayers.value.set(snapshot.key, snapshot.val() || null);
              }
            })
          );
        }
      })
    );

    offGameFuncs.push(
      onValue(gameStartedRef, (snapshot) => {
        gameStarted.value = snapshot.val();
        if (gameStarted.value) {
          retrieveWord();
        } else {
          word.value = "";
        }
      })
    );
    offGameFuncs.push(
      onChildAdded(participantsRef, (snapshot) => {
        if (snapshot.key) {
          players.value.set(snapshot.key, snapshot.val());
        }
      })
    );
    offGameFuncs.push(
      onChildRemoved(participantsRef, (snapshot) => {
        if (snapshot.key) {
          players.value.delete(snapshot.key);
        }
      })
    );
  }

  function detachGame() {
    offGameFuncs.forEach((offFunc) => offFunc());
    offGameFuncs.length = 0;
    offWhitePlayersFuncs.forEach((offFunc) => offFunc());
    offWhitePlayersFuncs.length = 0;

    admin.value = null;
    gameStarted.value = false;
    players.value.clear();
    whitePlayers.value.clear();
    gameId.value = null;
  }
  // #endregion

  return {
    gameId,
    admin,
    gameStarted,
    word,
    players,
    whitePlayers,
    amIAdmin,
    alreadyBelongsToAGame,
    createGame,
    startGame,
    endGame,
    makeAdmin,
    toggleWhitePlayer,
    joinGame,
    leaveGame,
    deleteGame,
  };
});
