<script setup lang="ts">
import Navigationbar from '@/components/Navigationbar.vue';

</script>

<template>
<v-app theme="light">
    <v-app-bar>
      <navigationbar/>
    </v-app-bar>
  
    <v-main>
      <router-view/>
    </v-main>
</v-app>

<v-footer class="align-center justify-center flex-wrap" color="#f5f5f5">
  <p> © 2026 LootBox Store. All rights reserved.</p>  
</v-footer>

</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}
@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
  .logo {
    margin: 0 2rem 0 0;
  }
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}

</style>