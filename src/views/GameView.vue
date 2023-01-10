<script lang="ts" setup>
import Game from '@/components/Game.vue';
import Lobby from '@/components/Lobby.vue';
import { useGameStore } from '@/stores/game';
import { useUserStore } from '@/stores/user';
import { child, getDatabase, onChildAdded, onChildRemoved, onValue, ref as fRef, update } from '@firebase/database';
import { onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();
const db = getDatabase();
const gameRef = fRef(db, `${route.params.id}`);
const participantsRef = child(gameRef, 'participants');
const whitesRef = child(gameRef, 'whitePlayers');
const gameStartedRef = child(gameRef, `gameStarted`);
const gameAdminRef = child(gameRef, `admin`);

const gameStartedOff = onValue(gameStartedRef, (snapshot) => {
  gameStore.gameStarted = snapshot.val();
});
const gameAdminOff = onValue(gameAdminRef, (snapshot) => {
  gameStore.admin = snapshot.val();
});
const wordOff = onValue(child(gameRef, `word`), (snapshot) => {
  gameStore.word = snapshot.val();
});
const addedParticipantOff = onChildAdded(participantsRef, (snapshot) => {
  gameStore.players[snapshot.key!] = snapshot.val();
});
const removedParticipantOff = onChildRemoved(participantsRef, (snapshot) => {
  delete gameStore.players[snapshot.key!];
  if (snapshot.key === userStore.user?.uid) {
    router.push({ name: 'home'});
  }
});
const addedWhiteOff = onChildAdded(whitesRef, (snapshot) => {
  gameStore.whitePlayers[snapshot.key!] = true;
});
const removedWhiteOff = onChildRemoved(whitesRef, (snapshot) => {
  delete gameStore.whitePlayers[snapshot.key!];
});

const onLeaveGame = () => {
  const updates: {[path: string]: any} = {};
  updates[`participants/${userStore.user?.uid}`] = null;
  updates[`whitePlayers/${userStore.user?.uid}`] = null;
  update(gameRef, updates);
  
  router.push({ name: 'home' });
}

onBeforeUnmount(() => {
  gameStartedOff();
  gameAdminOff();
  wordOff();
  addedParticipantOff();
  removedParticipantOff();
  addedWhiteOff();
  removedWhiteOff();
});
</script>

<template>
  <button v-if="!gameStore.amIAdmin" @click="onLeaveGame" class="btn btn-danger mb-1">Leave game</button>
  <Lobby v-if="!gameStore.gameStarted" :id="route.params.id" />
  <Game v-else :id="route.params.id" />
</template>