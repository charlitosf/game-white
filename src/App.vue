<script setup lang="ts">
import { RouterView } from "vue-router";
import NavbarComponent from "./components/NavbarComponent.vue";
</script>

<template>
  <NavbarComponent />
  <RouterView />
</template>

<style>
.btn {
  border-radius: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  /* margin-top: 10px; */
  padding: 10px 20px;
  transition-duration: 0.4s;
}

.btn-primary {
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary-dark);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  border: 1px solid var(--color-primary);
  color: #fff;
}

.btn-secondary {
  background-color: var(--color-secondary);
  border: 1px solid var(--color-secondary-dark);
}

.btn-secondary:hover {
  background-color: var(--color-secondary-dark);
  border: 1px solid var(--color-secondary);
  color: #fff;
}

.btn-danger {
  background-color: var(--color-danger);
  border: 1px solid var(--color-danger-dark);
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
  border: 1px solid var(--color-danger);
  color: #fff;
}

.container {
  margin: auto;
  padding: 0 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.inline-form-group {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.form-control {
  margin-bottom: 20px;
  padding: 9px 12px;
}

.inline-form-control {
  padding: 9px 12px;
  flex-grow: 1;
}

@media (width <= 768px) {
  .inline-form-control {
    margin-bottom: 20px;
  }

  .inline-form-group {
    flex-direction: column;
    align-items: unset;
  }
}

.form-control:focus,
.inline-form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem var(--color-primary);
}

.flex {
  display: flex;
}

.mt-1 {
  margin-top: 1rem;
}
.mt-2 {
  margin-top: 2rem;
}

.mb-1 {
  margin-bottom: 1rem;
}
.mb-2 {
  margin-bottom: 2rem;
}

.ml-auto {
  margin-left: auto;
}
.ml-1 {
  margin-left: 1rem;
}
.ml-2 {
  margin-left: 2rem;
}

.mr-auto {
  margin-right: auto;
}
.mr-1 {
  margin-right: 1rem;
}
.mr-2 {
  margin-right: 2rem;
}
</style>
