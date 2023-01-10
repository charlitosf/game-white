<script lang="ts" setup>
import { useGameStore } from '@/stores/game';
import { useUserStore } from '@/stores/user';
import { child, getDatabase, ref as fRef, set } from 'firebase/database';

const gameStore = useGameStore();
const userStore = useUserStore();
const props = defineProps<{
  id: string | string[];
}>();


const db = getDatabase();
const gameRef = fRef(db, `${props.id}`);

const onEndGame = () => {
  set(child(gameRef, 'gameStarted'), false);
  set(child(gameRef, 'word'), '');
};
</script>

<template>
  <button v-if="gameStore.amIAdmin" @click="onEndGame" class="btn btn-danger">End Game</button>
  <div class="container-fullscreen centered">
    <span v-if="gameStore.whitePlayers != null && gameStore.whitePlayers[userStore.user?.uid!]">White :)</span>
    <span v-else>{{ gameStore.word }}</span>
  </div>
</template>

<style>
.container-fullscreen {
  display: flex;
  height: 75vh;
  font-size: 5rem;
}

.centered {
  align-items: center;
  justify-content: center;
  margin: auto;
}
</style>