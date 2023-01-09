<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { computed } from '@vue/reactivity';
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

const amIAdmin = computed(() => game.value.admin == userStore.user?.uid);

const onEndGame = () => {
  set(child(gameRef, 'gameStarted'), false);
  set(child(gameRef, 'word'), '');
};


onBeforeUnmount(() => {
  offValue();
});
</script>

<template>
  <button v-if="amIAdmin" @click="onEndGame" class="btn btn-danger">End Game</button>
  <div class="container-fullscreen centered">
    <span v-if="game.whitePlayers != null && game.whitePlayers[userStore.user?.uid!]">White :)</span>
    <span v-else>{{ game.word }}</span>
  </div>
</template>

<style>
.container-fullscreen {
  display: flex;
  height: 75vh;
  width: 90vw;
  font-size: 5rem;
}

.centered {
  align-items: center;
  justify-content: center;
  margin: auto;
}
</style>