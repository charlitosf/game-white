<template>
  <div class="login-page">
    <div class="wallpaper"></div>

    <div v-if="userStore.authSettled" class="container">
      <router-view />
    </div>
    <font-awesome-icon class="icon" v-else :icon="['fas', 'spinner']" spin />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const userStore = useUserStore();
</script>

<style scoped>
.icon {
  font-size: 50px;
}

.login-page {
  align-items: center;
  justify-content: center;
  display: flex;
  height: 85vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.wallpaper {
  background: rgb(10, 96, 50);
  height: 100%;
  position: absolute;
  width: 100%;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.error {
  animation-name: errorShake;
  animation-duration: 0.3s;
}

@keyframes errorShake {
  0% {
    transform: translateX(-25px);
  }
  25% {
    transform: translateX(25px);
  }
  50% {
    transform: translateX(-25px);
  }
  75% {
    transform: translateX(25px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
