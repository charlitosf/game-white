<script lang="ts" setup>
import GameComponent from "@/components/GameComponent.vue";
import LobbyComponent from "@/components/LobbyComponent.vue";
import { useGameStore } from "@/stores/game";
import { useRouter } from "vue-router";

const router = useRouter();
const gameStore = useGameStore();

const onLeaveGame = () => {
  gameStore.leaveGame();

  router.replace({ name: "home" });
};

gameStore.$subscribe((_, state) => {
  if (!state.admin) {
    gameStore.gameId = null;
    router.replace({ name: "home" });
  }
});
</script>

<template>
  <button
    v-if="!gameStore.amIAdmin"
    @click="onLeaveGame"
    class="btn btn-danger mb-1"
  >
    Leave game
  </button>

  <LobbyComponent v-if="!gameStore.gameStarted" />
  <GameComponent v-else />
</template>
