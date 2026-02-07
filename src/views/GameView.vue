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
const onDeleteGame = () => {
  gameStore.deleteGame();
};
const onCopyGameLink = () => {
  navigator.clipboard.writeText(window.location.href);
  alert("Game link copied to clipboard");
};
</script>

<template>
  <div class="top-bar">
    <button
      v-if="!gameStore.amIAdmin"
      @click="onLeaveGame"
      class="btn btn-danger mb-1"
    >
      Leave game
    </button>
    <button v-else @click="onDeleteGame" class="btn btn-danger mb-1">
      Delete game
    </button>

    <button @click="onCopyGameLink" class="btn btn-primary mb-1">
      Copy game link
    </button>
  </div>

  <LobbyComponent v-if="!gameStore.gameStarted" />
  <GameComponent v-else />
</template>

<style lang="css" scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
}
</style>
