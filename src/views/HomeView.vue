<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useGameStore } from '@/stores/game';
import { useGameListStore } from '@/stores/gameList';

const router = useRouter();
const gameStore = useGameStore();
const gameListStore = useGameListStore();

const gameId = ref('');

const onStartGame = async () => {
  const gameCode = await gameStore.createGame();
  router.push(`/games/${gameCode}`);
};

const onJoinGame = async () => {
  const successful = await gameStore.joinGame(gameId.value);
  if (successful) {
    router.push(`/games/${gameId.value}`);
  } else {
    alert('Game does not exist or has already started!');
  }
};

const onDeleteGame = (gameIndex: string) => {
  gameListStore.deleteGame(gameIndex);
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
    <h2 v-if="!gameListStore.isEmptyGameList">My currently started games:</h2>
    <h2 v-else>You have not started any games yet!</h2>
    <div class="flex vertical-baselined background-container" v-for="game, index in gameListStore.gameList" :key="index">
      <span @click="gameId = game; onJoinGame()" class="main-element">{{ game }}</span>
      <button @click="onDeleteGame(game)" class="btn btn-danger">Delete</button>
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