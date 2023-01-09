<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { child, getDatabase, onChildAdded, onChildRemoved, onValue, ref as fRef, set, update } from '@firebase/database';
import { computed, onBeforeUnmount, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const props = defineProps<{
  id: string | string[];
}>();
const participants: Ref<{[uid: string]: string}> = ref({});
const whites: Ref<{ [uid: string]: boolean }> = ref({
  // uid: true
});
const word = ref('');
const admin = ref('');

const db = getDatabase();
const gameRef = fRef(db, `${props.id}`);
const participantsRef = child(gameRef, 'participants');
const whitesRef = child(gameRef, 'whitePlayers');

const amIAdmin = computed(() => admin.value == userStore.user?.uid);

const addedParticipantOff = onChildAdded(participantsRef, (snapshot) => {
  participants.value[snapshot.key!] = snapshot.val();
});

const removedParticipantOff = onChildRemoved(participantsRef, (snapshot) => {
  delete participants.value[snapshot.key!];
  if (snapshot.key === userStore.user?.uid) {
    router.push({ name: 'home'});
  }
});

const addedWhiteOff = onChildAdded(whitesRef, (snapshot) => {
  whites.value[snapshot.key!] = true;
});

const removedWhiteOff = onChildRemoved(whitesRef, (snapshot) => {
  delete whites.value[snapshot.key!];
});

const adminOff = onValue(child(gameRef, 'admin'), (snapshot) => {
  admin.value = snapshot.val();
});

const onStartGame = () => {
  set(child(gameRef, 'gameStarted'), true);
  set(child(gameRef, 'word'), word.value);
};

const onParticipantClicked = (participantUid: string) => {
  if (whites.value[participantUid]) {
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

onBeforeUnmount(() => {
  addedParticipantOff();
  removedParticipantOff();
  adminOff();
  addedWhiteOff();
  removedWhiteOff();
});
</script>

<template>
  <div class="container title">
    Lobby of game: {{ props.id }}
  </div>
  <div class="container mb-1">
    <form v-if="amIAdmin" class="inline-form-group">
      <input placeholder="Hidden word" type="text" v-model="word" class="inline-form-control"/>
      <button @click="onStartGame" class="btn btn-primary">Start Game</button>
    </form>
  </div>
  <div class="container">
    <h2>
      Participants - 
      <span v-if="amIAdmin">select whites</span>
      <span v-else>wait for the game to start</span>
    </h2>
    <div class="flex spread vertical-centered background-container" v-for="email, uid in participants" :key="uid">
      <label v-if="amIAdmin" class="switch">
        <input @change="onParticipantClicked(uid.toString())" :checked="whites[uid]" type="checkbox" />
        <span class="slider round"></span>
      </label>
      <span :class="amIAdmin ? 'ml-1' : ''">{{ email }}</span>
      <button v-if="amIAdmin" @click="onKick(uid.toString())" class="btn btn-danger ml-auto">Kick</button>
      <button v-if="amIAdmin" @click="onMakeAdmin(uid.toString())" class="btn btn-primary">Make admin</button>
    </div>
  </div>
</template>

<style>
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
  background-color: #ccc;
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
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
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