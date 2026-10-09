<template>
  <header class="line">
    <div>
      <img class="logo" src="" alt="EfreeLib Logo" />
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
