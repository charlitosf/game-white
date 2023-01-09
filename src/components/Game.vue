<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { child, getDatabase, onValue, ref as fRef, set } from 'firebase/database';
import { onBeforeUnmount, ref, type Ref } from 'vue';

const userStore = useUserStore();
const props = defineProps<{
  id: string | string[];
}>();
const game: Ref<{
  gameStarted: boolean;
  whitePlayers: { [uid: string]: boolean };
  word: string;
  participants: string[];
  admin: string;
}> = ref({
  gameStarted: false,
  whitePlayers: {},
  word: '',
  participants: [],
  admin: '',
});

const db = getDatabase();
const gameRef = fRef(db, `${props.id}`);
const offValue = onValue(gameRef, (snapshot) => {
  game.value = snapshot.val();
});

const onEndGame = () => {
  set(child(gameRef, 'gameStarted'), false);
  set(child(gameRef, 'word'), '');
};

onBeforeUnmount(() => {
  offValue();
});
</script>

<template>
  <button v-if="game.admin == userStore.user?.uid" @click="onEndGame">End Game</button>
  <h1>
    The word is 
    <span v-if="game.whitePlayers != null && game.whitePlayers[userStore.user?.uid!]">Blanco :·)</span>
    <span v-else>{{ game.word }}</span>
  </h1>
</template>