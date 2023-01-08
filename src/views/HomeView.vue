<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getDatabase, ref as fRef, runTransaction, onChildAdded, onChildRemoved, update } from 'firebase/database';
import { useUserStore } from '@/stores/user';
import { generate4DigitRandomNumber } from '@/utils/utils';
import { ref, type Ref } from 'vue';

const router = useRouter();
const userStore = useUserStore();
const db = getDatabase();
const rootRef = fRef(db);
const userRef = fRef(db, userStore.user?.uid);

const currentGames: Ref<string[]> = ref([]);
const gameId = ref('');

onChildAdded(userRef, (snapshot) => {
  currentGames.value.push(snapshot.key!);
});

onChildRemoved(userRef, (snapshot) => {
  const index = currentGames.value.indexOf(snapshot.key!);
  if (index > -1) {
    currentGames.value.splice(index, 1);
  }
});

const onStartGame = async () => {
  const rootRef = fRef(db);
  let gameCode: string = '';
  await runTransaction(rootRef, (currentData) => {
    if (currentData === null) {
      gameCode = generate4DigitRandomNumber();
      return {
        games: {
          [gameCode]: {
            [userStore.user?.uid!]: userStore.user?.email
          }
        },
        [userStore.user?.uid!]: {
          [gameCode]: {
            gameStarted: false,
            // White players: []
            // Word: ''
          },
        },
      };
    } else {
      let existingGames: string[] = [];
      if (currentData.games) {
        existingGames = Object.keys(currentData.games);
      }
      let gameCode = generate4DigitRandomNumber();
      while (existingGames.includes(gameCode)) {
        gameCode = generate4DigitRandomNumber();
      }
      currentData.games[gameCode] = {
        [userStore.user?.uid!]: userStore.user?.email
      };
      currentData[userStore.user?.uid!][gameCode] = {
        gameStarted: false,
        // White players: []
        // Word: ''
      };
      return currentData;
    }
  })
  router.push(`/lobbies/${gameCode}`);
};

const onJoinGame = () => {
  router.push(`/lobbies/${gameId.value}`);
};

const onDeleteGame = (gameIndex: number) => {
  const gameCode = currentGames.value[gameIndex];

  const updates: {[id: string]: null} = {};
  updates[`/games/${gameCode}`] = null;
  updates[`/${userStore.user?.uid!}/${gameCode}`] = null;

  update(rootRef, updates);

};
</script>

<template>
  <h1>Welcome to the game "White"!</h1>
  <button @click="onStartGame">Start new game</button>
  <button @click="onJoinGame">Join game</button>
  <input type="text" v-model="gameId" />
  <h2>
    My currently started games:
  </h2>
  <ul>
    <li v-for="game, index in currentGames">
      {{ game }}
      <button @click="onDeleteGame(index)">Delete</button>
    </li>
  </ul>
</template>
