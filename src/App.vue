<template>
  <!-- Navigation Bar -->
  <section>
    <nav>
      <NavBar />
    </nav>
  </section>

  <!-- Page Content: Show Vue Router Views -->
  <router-view />

  <!-- Default Welcome Components (Only Visible on Non-Routed Pages) -->
  <div v-if="$route.path === '/'">
    <header>
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
      <div class="wrapper">
        <HelloWorld msg="Chris!" />
      </div>
    </header>

    <main>
      <TheWelcome />
    </main>
  </div>
</template>

<script setup>
import HelloWorld from './components/HelloWorld.vue';
import TheWelcome from './components/TheWelcome.vue';
import NavBar from './components/NavBar.vue';
</script>

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
