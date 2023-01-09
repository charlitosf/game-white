<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { getDatabase, onChildAdded, onChildRemoved, ref as fRef, set } from '@firebase/database';
import { onBeforeUnmount, ref, type Ref } from 'vue';
const userStore = useUserStore();


const props = defineProps<{
  id: string | string[];
}>();
const participants: Ref<string[]> = ref([]);
const word = ref('');

const db = getDatabase();
const gameRef = fRef(db, `games/${props.id}`);
const ownGameRef = fRef(db, `${userStore.user?.uid}/${props.id}`);

const addedOff = onChildAdded(gameRef, (snapshot) => {
  participants.value.push(snapshot.val());
});

const removedOff = onChildRemoved(gameRef, (snapshot) => {
  const index = participants.value.indexOf(snapshot.val());
  if (index > -1) {
    participants.value.splice(index, 1);
  }
});

const onStartGame = () => {
  set(ownGameRef, {
    gameStarted: true,
    word: word.value,
  });
};

onBeforeUnmount(() => {
  addedOff();
  removedOff();
});
</script>

<template>
  <h1>Lobby of game {{ props.id }}</h1>
  <button @click="onStartGame">Start Game</button>
  <input type="text" v-model="word" />
  <h2>Participants</h2>
  <ul>
    <li v-for="participant in participants" :key="participant">
      {{ participant }}
    </li>
  </ul>
</template>