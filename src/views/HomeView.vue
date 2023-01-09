<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getDatabase, ref as fRef, runTransaction, onChildAdded, onChildRemoved, update, set, child, onValue } from 'firebase/database';
import { useUserStore } from '@/stores/user';
import { generate4DigitRandomNumber } from '@/utils/utils';
import { ref, type Ref } from 'vue';

const router = useRouter();
const userStore = useUserStore();
const db = getDatabase();
const rootRef = fRef(db);

const currentGames: Ref<string[]> = ref([]);
const gameId = ref('');

onChildAdded(rootRef, (snapshot) => {
  if (snapshot.val().admin === userStore.user?.uid) {
    currentGames.value.push(snapshot.key!);
  }
});

onChildRemoved(rootRef, (snapshot) => {
  const index = currentGames.value.indexOf(snapshot.key!);
  if (index > -1) {
    currentGames.value.splice(index, 1);
  }
});

const onStartGame = async () => {
  let gameCode: string = generate4DigitRandomNumber();
  await runTransaction(rootRef, (currentData) => {
    const gameObject = {
      admin: userStore.user?.uid,
      participants: {
        [userStore.user?.uid!]: userStore.user?.email
      },
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
  router.push(`/games/${gameCode}`);
};

const onJoinGame = () => {
  const gameRef = fRef(db, `${gameId.value}`);
  const gameUserRef = child(gameRef, `participants/${userStore.user?.uid!}`);
  set(gameUserRef, userStore.user?.email);
  router.push(`/games/${gameId.value}`);
};

const onDeleteGame = (gameIndex: number) => {
  const gameCode = currentGames.value[gameIndex];

  const gameRef = fRef(db, `${gameCode}`);
  set(gameRef, null);
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
