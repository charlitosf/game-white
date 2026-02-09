<script lang="ts" setup>
import { ref } from "vue";
import { useGameStore } from "@/stores/game";

const gameStore = useGameStore();
const isFlipped = ref(false);

const onEndGame = () => {
  gameStore.endGame();
};

const onToggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};
</script>

<template>
  <div class="flex justify-end">
    <button v-if="gameStore.amIAdmin" @click="onEndGame" class="btn btn-danger">
      End Game
    </button>
  </div>
  <div class="container-fullscreen centered">
    <div class="flip-card" @click="onToggleFlip">
      <div class="flip-card-inner" :class="{ flipped: isFlipped }">
        <div class="flip-card-front">Tap to reveal</div>
        <div
          class="flip-card-back wrap-word"
          :class="{ white: gameStore.amIWhitePlayer }"
        >
          {{ gameStore.word }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.container-fullscreen {
  display: flex;
  height: 75vh;
  font-size: 5rem;
  @media (max-width: 600px) {
    font-size: 3rem;
  }
}

.centered {
  align-items: center;
  justify-content: center;
  margin: auto;
}

.wrap-word {
  word-break: break-word;
}

.justify-end {
  justify-content: end;
}

.flip-card {
  margin: 1rem;
  width: min(70vw, 520px);
  height: auto;
  max-height: 70vh;
  background-color: transparent;
  border-radius: 10px;
  perspective: 1000px;
  overflow: hidden;
}

.flip-card-inner {
  position: relative;
  display: grid;
  width: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  border-radius: 10px;
}

.flip-card {
  cursor: pointer;
}

.flip-card-inner.flipped {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: relative;
  grid-area: 1 / 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  border-radius: 10px;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
}

.flip-card-front {
  background-color: var(--color-primary);
  color: white;
}

.flip-card-back {
  background-color: var(--color-primary);
  min-height: min(70vh, 300px);
  color: white;
  transform: rotateY(180deg);
}

.white {
  background-color: red;
  color: white;
}
</style>
