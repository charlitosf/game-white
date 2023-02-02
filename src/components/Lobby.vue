<script lang="ts" setup>
import { useGameStore } from '@/stores/game';
import { useGameListStore } from '@/stores/gameList';
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const gameStore = useGameStore();
const gameListStore = useGameListStore();
const router = useRouter();

const word = ref('');

const moreThanOnePlayer = computed(() => Object.keys(gameStore.players).length > 1);

const onStartGame = () => {
  gameStore.startGame(word.value);
};

const onParticipantClicked = (participantUid: string) => {
  gameStore.toggleWhitePlayer(participantUid);
};

const onKick = (participantUid: string) => {
  gameStore.leaveGame(participantUid);
};

const onMakeAdmin = (participantUid: string) => {
  gameStore.makeAdmin(participantUid);
};

const onMakeAdminRandomly = () => {
  gameStore.makeAdmin();
};

const onDeleteGame = () => {
  gameListStore.deleteAdminGame();
  gameStore.gameId = null;

  router.push({ name: 'home' });
}
</script>

<template>
  <button v-if="gameStore.amIAdmin" @click="onDeleteGame" class="btn btn-danger mb-1">Delete game</button>
  <div class="container title mb-1">
    Lobby of game: {{ gameStore.gameId }}
  </div>
  <form v-if="gameStore.amIAdmin" @submit.prevent="onStartGame" class="inline-form-group mb-2">
    <input placeholder="Hidden word" type="text" v-model="word" class="inline-form-control"/>
    <button type="submit" class="btn btn-primary">Start Game</button>
  </form>
  <div class="container">
    <h2 class="mb-1">
      <div class="flex spread">
        <div>
          Participants -
          <span v-if="gameStore.amIAdmin"> select whites</span>
          <span v-else> wait for the game to start</span>
        </div>
        <div>
          <button v-if="gameStore.amIAdmin && moreThanOnePlayer" @click="onMakeAdminRandomly" class="btn btn-secondary">Make admin randomly</button>
        </div>
      </div>
    </h2>
    <div :class="{'align-end': gameStore.amIAdmin}" class="flex spread vertical-centered background-container" v-for="email, uid in gameStore.players" :key="uid">
      <label v-if="gameStore.amIAdmin" class="switch">
        <input @change="onParticipantClicked(uid.toString())" :checked="gameStore.whitePlayers[uid]" type="checkbox" />
        <span class="slider round"></span>
      </label>
      <span :class="{'ml-1': gameStore.amIAdmin}" class="fs-1 mr-1">{{ email }}</span>
      <button v-if="gameStore.amIAdmin" @click="onKick(uid.toString())" class="btn btn-danger ml-auto">Kick</button>
      <button v-if="gameStore.amIAdmin" @click="onMakeAdmin(uid.toString())" class="btn btn-primary">Make admin</button>
    </div>
  </div>
</template>

<style>
.align-end {
  justify-content: flex-end;
}

.fs-1 {
  font-size: 1rem;
}
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-background);
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: var(--color-heading);
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--color-primary);
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>