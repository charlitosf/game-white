<script lang="ts" setup>
import { getDatabase, onChildAdded, onChildRemoved, ref as fRef } from '@firebase/database';
import { ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();
const gameId: Ref<string | string[]> = ref(route.params.id);

const participants: Ref<string[]> = ref([]);

const db = getDatabase();
const gameRef = fRef(db, `games/${gameId.value}`);

let offAdded = onChildAdded(gameRef, (snapshot) => {
  participants.value.push(snapshot.val());
});

let offRemoved = onChildRemoved(gameRef, (snapshot) => {
  const index = participants.value.indexOf(snapshot.val());
  if (index > -1) {
    participants.value.splice(index, 1);
  }
});
watch(() => route.params, (newParams) => {
  offAdded();
  offRemoved();
  participants.value = [];
  
  gameId.value = newParams.id;
  offAdded = onChildAdded(gameRef, (snapshot) => {
    participants.value.push(snapshot.val());
  });

  offRemoved = onChildRemoved(gameRef, (snapshot) => {
    const index = participants.value.indexOf(snapshot.val());
    if (index > -1) {
      participants.value.splice(index, 1);
    }
  });
});


const onStartGame = () => {
  router.push('/game');
};
</script>

<template>
  <h1>
    Lobby
  </h1>
  <button @click="onStartGame">Start Game</button>
  <h2>Participants</h2>
  <ul>
    <li v-for="participant in participants" :key="participant">
      {{ participant }}
    </li>
  </ul>
</template>