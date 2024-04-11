<script lang="ts">
  import { currentAiCreationObject, supportedAiModelTypes } from "../../../../store";

  // Reactive statement to ensure we react to changes in the current AI creation object
  $: currentCreation = $currentAiCreationObject;

  function updateType(type) {
    currentAiCreationObject.update((currentCreation) => {
      currentCreation.llm.selectedModel = type;
      return currentCreation;
    });
  };
</script>

<div class="mt-4">
  {#each $supportedAiModelTypes as type}
    <button 
      on:click|preventDefault={() => updateType(type)} 
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2">
      Select {type}
    </button>
  {/each}
</div>
