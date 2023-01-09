<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { child, getDatabase, onChildAdded, onChildRemoved, onValue, ref as fRef, set } from '@firebase/database';
import { onBeforeUnmount, ref, type Ref } from 'vue';

const userStore = useUserStore();
const props = defineProps<{
  id: string | string[];
}>();
const participants: Ref<string[]> = ref([]);
const word = ref('');
const admin = ref('');

const db = getDatabase();
const gameRef = fRef(db, `${props.id}`);
const participantsRef = child(gameRef, 'participants');

const addedOff = onChildAdded(participantsRef, (snapshot) => {
  participants.value.push(snapshot.val());
});

const removedOff = onChildRemoved(participantsRef, (snapshot) => {
  const index = participants.value.indexOf(snapshot.val());
  if (index > -1) {
    participants.value.splice(index, 1);
  }
});

const adminOff = onValue(child(gameRef, 'admin'), (snapshot) => {
  admin.value = snapshot.val();
});

const onStartGame = () => {
  set(child(gameRef, 'gameStarted'), true);
  set(child(gameRef, 'word'), word.value);
};

onBeforeUnmount(() => {
  addedOff();
  removedOff();
  adminOff();
});
</script>

<template>
  <h1>Lobby of game {{ props.id }}</h1>
  <div v-if="admin == userStore.user?.uid">
    <button @click="onStartGame">Start Game</button>
    <input type="text" v-model="word" />
  </div>
  <h2>Participants</h2>
  <ul>
    <li v-for="participant in participants" :key="participant">
      {{ participant }}
    </li>
  </ul>
</template>