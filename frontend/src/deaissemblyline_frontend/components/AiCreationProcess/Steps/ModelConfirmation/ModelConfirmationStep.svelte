<script lang="ts">
  import { store, currentAiCreationObject } from "../../../../store";

  let showCreateModelFirstMessage = !$currentAiCreationObject.createdBackendCanisterId || $currentAiCreationObject.createdBackendCanisterId === "";

  const dfxCommandString = `dfx canister call ${$currentAiCreationObject.createdBackendCanisterId} Inference '(record {prompt="Joe went swimming in the pool"; steps=30; temperature=0.1; topp=0.9; rng_seed=0;})'`;
  const candidUiUrl = `https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${$currentAiCreationObject.createdBackendCanisterId}`;
</script>

<section class="bg-white dark:bg-gray-900 bg-[url('/images/hero-pattern.svg')]" >
  <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
    {#if !$store.isAuthed}
      <div>
        <p>Please log in first. You may only interact with your AI model if you're logged in (such that it knows it's you).</p>
      </div>
    {:else if showCreateModelFirstMessage}
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Create Your AI First!</h1> 
      <div>
        <p>Please first create your AI model on the previous step.</p>
      </div>
    {:else}
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Your AI is Ready to Go!</h1>  

      <p class="mt-4 text-black dark:text-white font-semibold">Created model type: {$currentAiCreationObject.llm.selectedModel}</p>
      <p class="mt-2 text-black dark:text-white">Your AI model runs in a canister smart contract on the Internet Computer. This canister along with the AI is under your control and belongs to you.</p>
      <p class="mt-4 text-black dark:text-white font-semibold">Your AI model canister address on the Internet Computer: {$currentAiCreationObject.createdBackendCanisterId}</p>

      <p class="mt-2 text-black dark:text-white">Next up, you can interact with your AI model.</p>
      <p class="mt-2 text-black dark:text-white">For this, there's a chat interface on the next step.</p>
      <p class="mt-2 text-black dark:text-white">Each canister on the Internet Computer gets provided a user interface you can use by default (it's called Candid UI).</p>
      <p class="mt-2 text-black dark:text-white">You can view your AI model canister's Candid UI here:</p>
      <a href={candidUiUrl} target='_blank' rel="noreferrer" class='underline'>Open Candid UI in a new browser tab</a>
      <p class="mt-2 text-black dark:text-white">If you like, you can also interact from the command line with dfx (advanced):</p>
      <p class="mt-2 text-black dark:text-white">{dfxCommandString}</p>
      <p class="mt-2 text-black dark:text-white">Please note that only your account on this dApp is allowed to interact with this AI model canister. When you logged in, a unique login credential was created for you and your AI model canister was linked to this credential (such that only you may use your AI). The credential is not the same as on other dApps. This way, you stay anonymous across different dApps.</p>
    {/if}
  </div> 
</section>