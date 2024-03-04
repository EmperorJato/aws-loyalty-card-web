<template>
  <v-snackbar
    :timeout="alert.timeout"
    v-model="alert.show"
    location="top end"
    transition="slide-x-reverse-transition"
    :color="alert.type"
  >
    <v-alert :type="alert.type" border prominent>
      <template v-slot:title>
        <div class="text-subtitle-1 font-weight-bold">
          {{ alert.title }}
        </div>
      </template>
      <template v-slot:text>
        <div class="text-subtitle-2">
          {{ alert.description }}
        </div>
      </template>
    </v-alert>
    <template v-slot:actions>
      <v-btn density="compact" icon="mdi-close" @click="alert.show = false">
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useAlertSnackbarStore } from "~/stores/alert-snackbar";

const alertStore = useAlertSnackbarStore();

const alert = computed(() => alertStore.alertSnackbar);
</script>

<style>
.v-snackbar__content {
  padding: 0 !important;
}
</style>
