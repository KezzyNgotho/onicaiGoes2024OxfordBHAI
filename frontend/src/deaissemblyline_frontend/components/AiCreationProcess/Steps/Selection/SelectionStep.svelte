<script lang="ts">
  import { currentAiCreationObject } from "../../../../store";
  import ModelTypeInfo from "./ModelTypeInfo.svelte"; // This component displays info on the selected modelType
  import AiModelOptions from './AiModelOptions.svelte';
</script>

<section class="bg-white dark:bg-gray-900 bg-[url('/images/hero-pattern.svg')]" >
  <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
    <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
      Select AI Model</h1>  

    <p class="mt-4 text-black dark:text-white font-semibold">Currently selected AI model to be created: {$currentAiCreationObject.llm.selectedModel}</p>
    <p class="mt-2 text-black dark:text-white">You can change the AI model to be created. Options are available below.</p>

    <div class="py-4 mt-4 space-y-3 bg-blue-50 dark:bg-blue-800 shadow-md border border-gray-300 dark:border-gray-700 rounded-lg">
      <ModelTypeInfo />
    </div>

    <AiModelOptions /> 

    <div>
      <p class="mt-2 text-black dark:text-white">All AI models you can select are open-source. This means they were published with full transparency and contributed to society as public goods.</p>
      <p class="mt-2 text-black dark:text-white">The name of the AI model usually refers to the family of models it belongs to or to their original creators.</p>
      <p class="mt-2 text-black dark:text-white">The number of parameters describes the size of the AI model. Each parameter's value gets set during the training process of the AI model. Together, the parameters determine the response the AI model generates to your prompts.</p>
    </div>
  </div>  
</section>
