<script lang="ts">
  import { currentAiCreationObject } from "../../../../store";
  import { onMount } from 'svelte';
  
  import NonSupportedModelType from '../../NonSupportedModelType.svelte';

  let ModelInfoComponent;

  const loadInfoComponent = async (modelType) => {
    switch(modelType) {
      case '#Llama2_260K':
        ModelInfoComponent = (await import('./ModelTypes/260kModelInfo.svelte')).default;
        break;
      case '#Llama2_15M':
        ModelInfoComponent = (await import('./ModelTypes/15mModelInfo.svelte')).default;
        break;
      // Add cases for other model types here
      default:
        ModelInfoComponent = NonSupportedModelType; // Use the non-supported model type component for unsupported types
    };
  };

  // Reactively update the component based on the selected model type
  $: $currentAiCreationObject.llm.selectedModel, loadInfoComponent($currentAiCreationObject.llm.selectedModel);

  onMount(() => {
    loadInfoComponent($currentAiCreationObject.llm.selectedModel);
  });
</script>

{#if ModelInfoComponent}
  <svelte:component this={ModelInfoComponent} />
{:else}
  <p>Please select a model type to see more information.</p>
{/if}
