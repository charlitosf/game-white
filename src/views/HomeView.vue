<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useGameStore } from "@/stores/game";

const router = useRouter();
const gameStore = useGameStore();

const gameIdForm = ref("");

const onStartGame = async () => {
  await gameStore.createGame();
  router.push({ name: "lobby", params: { gameId: gameStore.gameId } });
};

const onJoinGame = async () => {
  const successful = await gameStore.joinGame(gameIdForm.value);
  if (successful) {
    router.push({ name: "lobby", params: { gameId: gameIdForm.value } });
  } else {
    alert("Game does not exist or has already started!");
  }
};
</script>

<template>
  <div class="container flex spread vertical-centered mb-1 title">
    Welcome to the game "White"!
    <button @click="onStartGame" class="btn btn-primary ml-1">
      Start new game
    </button>
  </div>
  <div class="container mb-1">
    <form @submit.prevent="onJoinGame" class="inline-form-group">
      <input
        type="text"
        v-model="gameIdForm"
        class="inline-form-control"
        placeholder="Game code"
      />
      <button type="submit" class="btn btn-primary">Join game</button>
    </form>
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
