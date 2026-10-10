<template>
  <header class="line">
    <div>
      <RouterLink to="/">
        <img class="logo" src="" alt="EfreeLib Logo" />
      </RouterLink>
    </div>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/library">Library</RouterLink>
      <RouterLink to="/favorites">Favorites</RouterLink>
    </nav>
    <div></div>
  </header>

  <div id="routerview">
    <RouterView :key="$route.fullPath" />
  </div>
</template>
