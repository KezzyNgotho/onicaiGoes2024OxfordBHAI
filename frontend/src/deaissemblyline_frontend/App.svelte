<script lang="ts">
  import Router from "svelte-spa-router";

  import Intro from "./pages/Intro.svelte";

  import CreateAi from "./pages/CreateAi.svelte";

  import LearnWithAI from "./pages/LearnWithAI.svelte";

  import About from "./pages/About.svelte";
    
  import NotFound from "./pages/NotFound.svelte";

  const routes = {
    // Exact path (with /# in front of route)
    "/": Intro,
    //"/create": CreateAi,
    "/learn": LearnWithAI,
    "/about": About, //e.g. URL: https://....ic0.app/#/about
    // Catch-all (this is optional, but if present it must be the last)
    "*": NotFound,
  };
</script>

<div class="App">
  <Router {routes} />
</div>
