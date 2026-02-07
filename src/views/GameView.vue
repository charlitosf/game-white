<script lang="ts" setup>
import GameComponent from "@/components/GameComponent.vue";
import LobbyComponent from "@/components/LobbyComponent.vue";
import { useGameStore } from "@/stores/game";
import { useRouter } from "vue-router";

const router = useRouter();
const gameStore = useGameStore();

if (gameStore.gameId === null) {
  gameStore.joinGame(router.currentRoute.value.params.gameId as string);
}

const onLeaveGame = () => {
  gameStore.leaveGame();
};
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
