<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getDatabase, ref as fRef, runTransaction, onChildAdded, onChildRemoved, set } from 'firebase/database';
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

const onJoinGame = async () => {
  const gameRef = fRef(db, `${gameId.value}`);
  try {
    const result = await runTransaction(gameRef, (currentData) => {
      if (currentData === null) {
        return;
      } else if (currentData.admin === userStore.user?.uid) {
        return currentData;
      } else if (currentData.gameStarted) {
        return;
      } else if (currentData.admin !== userStore.user?.uid) {
        currentData.participants = {
          ...currentData.participants,
          [userStore.user?.uid!]: userStore.user?.email,
        };
        return currentData;
      }
    });
    if (result.committed) {
      router.push(`/games/${gameId.value}`);
    } else {
      alert('Game does not exist or has already started!');
    }
  } catch (error) {
    alert('Game does not exist or has already started!')
  }
};

const onDeleteGame = (gameIndex: number) => {
  const gameCode = currentGames.value[gameIndex];

  const gameRef = fRef(db, `${gameCode}`);
  set(gameRef, null);
};
</script>

<template>
  <div class="container flex spread vertical-centered mb-1 title">
    Welcome to the game "White"!
    <button @click="onStartGame" class="btn btn-primary ml-1">Start new game</button>
  </div>
  <div class="container mb-1">
    <form @submit.prevent="onJoinGame" class="inline-form-group">
      <input type="text" v-model="gameId" class="inline-form-control" placeholder="Game code" />
      <button type="submit" class="btn btn-primary">Join game</button>
    </form>
  </div>
  <div class="container">
    <h2>
      My currently started games:
    </h2>
    <div class="flex vertical-baselined background-container" v-for="game, index in currentGames" :key="index">
      <span @click="gameId = game; onJoinGame()" class="main-element">{{ game }}</span>
      <button @click="onDeleteGame(index)" class="btn btn-danger">Delete</button>
    </div>
  </div>
</template>

<style>
.spread {
  justify-content: space-between;
}

.vertical-centered {
  align-items: center;
}

.vertical-baselined {
  align-items: baseline;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  background-color: var(--color-background-soft);
}

.background-container {
  background-color: var(--color-background-mute);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.main-element {
  background-color: var(--color-background-soft);
  padding: 1rem;
  flex-grow: 1;
}
</style>