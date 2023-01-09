<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { child, getDatabase, onChildAdded, onChildRemoved, onValue, ref as fRef, set, update } from '@firebase/database';
import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';

const userStore = useUserStore();
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
  set(child(participantsRef, participantUid), null);
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
  <h1>Lobby of game {{ props.id }}</h1>
  <div v-if="amIAdmin">
    <button @click="onStartGame">Start Game</button>
    <input type="text" v-model="word" />
  </div>
  <h2>
    Participants - 
    <span v-if="amIAdmin">check for whites</span>
    <span v-else>wait for the game to start</span>
  </h2>
  <ul>
    <li v-for="email, uid in participants" :key="uid">
      <input v-if="amIAdmin" @change="onParticipantClicked(uid.toString())" :checked="whites[uid]" type="checkbox" />
      {{ email }}
      <button v-if="amIAdmin" @click="onKick(uid.toString())">Kick</button>
      <button v-if="amIAdmin" @click="onMakeAdmin(uid.toString())">Make admin</button>
    </li>
  </ul>
</template>