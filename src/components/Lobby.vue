<script lang="ts" setup>
import { useGameStore } from '@/stores/game';
import { useUserStore } from '@/stores/user';
import { child, getDatabase, ref as fRef, set, update } from '@firebase/database';
import { ref } from 'vue';

const gameStore = useGameStore();
const userStore = useUserStore();

const props = defineProps<{
  id: string | string[];
}>();
const word = ref('');

const db = getDatabase();
const gameRef = fRef(db, `${props.id}`);
const whitesRef = child(gameRef, 'whitePlayers');

const onStartGame = () => {
  set(child(gameRef, 'gameStarted'), true);
  set(child(gameRef, 'word'), word.value);
};

const onParticipantClicked = (participantUid: string) => {
  if (gameStore.whitePlayers[participantUid]) {
    set(child(whitesRef, participantUid), null);
  } else {
    set(child(whitesRef, participantUid), true);
  }
};

const onKick = (participantUid: string) => {
  const updates: {[path: string]: any} = {};
  updates[`/participants/${participantUid}`] = null;
  updates[`/whitePlayers/${participantUid}`] = null;
  update(gameRef, updates);
};

const onMakeAdmin = (participantUid: string) => {
  const updates: {[path: string]: any} = {};
  updates['/admin'] = participantUid;
  updates[`/participants/${userStore.user?.uid}`] = userStore.user?.email;
  updates[`/participants/${participantUid}`] = null;
  update(gameRef, updates);
};

</script>

<template>
  <div class="container title mb-1">
    Lobby of game: {{ props.id }}
  </div>
  <form v-if="gameStore.amIAdmin" class="inline-form-group mb-2">
    <input placeholder="Hidden word" type="text" v-model="word" class="inline-form-control"/>
    <button @click="onStartGame" class="btn btn-primary">Start Game</button>
  </form>
  <div class="container">
    <h2 class="mb-1">
      Participants - 
      <span v-if="gameStore.amIAdmin">select whites</span>
      <span v-else>wait for the game to start</span>
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