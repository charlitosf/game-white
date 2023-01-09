<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { getDatabase, onValue, ref as fRef, set } from 'firebase/database';
import { onBeforeUnmount, ref, type Ref } from 'vue';

const userStore = useUserStore();
const props = defineProps<{
  id: string | string[];
}>();
const game: Ref<{
  gameStarted: boolean;
  whitePlayers: string[];
  word: string;
}> = ref({
  gameStarted: false,
  whitePlayers: [],
  word: '',
});

const db = getDatabase();
const gameRef = fRef(db, `${userStore.user?.uid}/${props.id}`);
const offValue = onValue(gameRef, (snapshot) => {
  game.value = snapshot.val();
});

const onEndGame = () => {
  set(gameRef, {
    gameStarted: false,
    whitePlayers: game.value.whitePlayers ? game.value.whitePlayers : [],
    word: '',
  });
};

onBeforeUnmount(() => {
  offValue();
});
</script>

<template>
  <button @click="onEndGame">End Game</button>
  <h1>
    The word is 
    <span v-if="game.whitePlayers != null && game.whitePlayers.includes(userStore.user?.uid!)">Blanco :·)</span>
    <span v-else>{{ game.word }}</span>
  </h1>
</template>