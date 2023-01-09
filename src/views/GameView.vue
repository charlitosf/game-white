<script lang="ts" setup>
import Lobby from '@/components/Lobby.vue';
import { useRoute } from 'vue-router';

const route = useRoute();


</script>

<template>
  <Lobby :id="route.params.id" />
</template>