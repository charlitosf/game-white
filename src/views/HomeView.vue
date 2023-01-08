<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getDatabase, ref as fRef, runTransaction } from 'firebase/database';
import { useUserStore } from '@/stores/user';
import { generate4DigitRandomNumber } from '@/utils/utils';

const router = useRouter();

const onStartGame = async () => {
  const db = getDatabase();
  const rootRef = fRef(db);
  const userStore = useUserStore();
  await runTransaction(rootRef, (currentData) => {
    if (currentData === null) {
      const gameCode = generate4DigitRandomNumber();
      return {
        games: {
          [gameCode]: {
            [userStore.user?.uid!]: true
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
        [userStore.user?.uid!]: true
      };
      currentData[userStore.user?.uid!][gameCode] = {
        gameStarted: false,
        // White players: []
        // Word: ''
      };
      return currentData;
    }
  })
  router.push('/lobby');
};

const onJoinGame = () => {
  router.push('/lobby');
};
</script>

<template>
  <h1>Welcome to the game "White"!</h1>
  <button @click="onStartGame">Start new game</button>
  <button @click="onJoinGame">Join game</button>
  <h2>
    My currently started games:
  </h2>
  <div>
    Game1
  </div>
</template>
