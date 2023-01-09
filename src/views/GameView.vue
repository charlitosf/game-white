<script lang="ts" setup>
import Game from '@/components/Game.vue';
import Lobby from '@/components/Lobby.vue';
import { useUserStore } from '@/stores/user';
import { child, getDatabase, onValue, ref as fRef, set, update } from '@firebase/database';
import { computed } from '@vue/reactivity';
import { onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const db = getDatabase();
const gameRef = fRef(db, `${route.params.id}`);
const gameStartedRef = child(gameRef, `gameStarted`);
const gameAdminRef = child(gameRef, `admin`);
const gameStarted = ref(false);
const gameAdmin = ref('');

const gameStartedOff = onValue(gameStartedRef, (snapshot) => {
  gameStarted.value = snapshot.val();
});

const gameAdminOff = onValue(gameAdminRef, (snapshot) => {
  gameAdmin.value = snapshot.val();
});

const amIAdmin = computed(() => gameAdmin.value == userStore.user?.uid);

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
});
</script>

<template>
  <button v-if="!amIAdmin" @click="onLeaveGame" class="btn btn-danger mb-1">Leave game</button>
  <Lobby v-if="!gameStarted" :id="route.params.id" />
  <Game v-else :id="route.params.id" />
</template>