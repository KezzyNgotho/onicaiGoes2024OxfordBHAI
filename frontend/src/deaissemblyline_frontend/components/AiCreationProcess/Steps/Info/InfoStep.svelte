<script lang="ts">
  import { currentAiCreationObject } from "../../../../store";
</script>

<section class="bg-white dark:bg-gray-900 bg-[url('/images/hero-pattern.svg')]" >
  <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
    <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
      Quick Overview</h1>  

    <p class="mt-4 text-black dark:text-white font-semibold">Currently selected model type: {$currentAiCreationObject.llm.selectedModel}</p>
    <p class="mt-2 text-black dark:text-white">You can change the AI model to be created on the previous step.</p>

    <p class="mt-2 text-black dark:text-white">Next up, you will create this AI model on the Internet Computer - where it will run as an on-chain Large Language Model (LLM)!</p>
    <p class="mt-2 text-black dark:text-white">And what's more, it belongs to you! It's running in an Internet Computer canister which is under your control and it thus is your personal AI.</p>

    <p class="mt-2 text-black dark:text-white">For an example of such an on-chain LLM (actually the first one ever), check out ICGPT if you like:</p>
    <a href='https://icgpt.icpp.world/' target='_blank' rel="noreferrer" class='underline'>Open ICGPT in a new browser tab</a>

  </div>  
</section>