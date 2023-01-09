<script lang="ts" setup>
import Game from '@/components/Game.vue';
import Lobby from '@/components/Lobby.vue';
import { useUserStore } from '@/stores/user';
import { getDatabase, onValue, ref as fRef } from '@firebase/database';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const userStore = useUserStore();
const route = useRoute();
const db = getDatabase();
const gameStartedRef = fRef(db, `${userStore.user?.uid}/${route.params.id}/gameStarted`);
const gameStarted = ref(false);

onValue(gameStartedRef, (snapshot) => {
  gameStarted.value = snapshot.val();
});
</script>

<template>
  <Lobby v-if="!gameStarted" :id="route.params.id" />
  <Game v-else :id="route.params.id" />
</template>