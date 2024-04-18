<script lang="ts">
  import { store, currentAiCreationObject } from "../../../../store";

  import spinner from "../../../../assets/loading.gif";

  let validationErrors = [];

  // Function to validate the donation details
  function validateModelDetails() {
    validationErrors = []; // Reset errors

    $currentAiCreationObject.llm.selectedModel || validationErrors.push('AI model selection is missing. Please select a model on the previous step.');
  };

  // Call validation on component mount
  validateModelDetails();

  let modelCreationInProgress = false;
  let modelCreationError = false;
  let modelCreationSuccess = false;
  let createdModelCanisterId;

  async function createModel() {
    if (!$store.isAuthed) {
      return;
    };
    console.log("#######Debug createModel");
    // Create the model for the user in the backend
    modelCreationInProgress = true;
    // AIssembly Canister Integration
    var selectedModel = [];
    if ($currentAiCreationObject.llm.selectedModel === "#Llama2_15M") {
      const llama215mSelectionValue = { 'Llama2_15M' : null };
      selectedModel = [llama215mSelectionValue];
    } else {
      selectedModel = [{ 'Llama2_260K' : null }]; // default model
    };

    const modelInput = {
      canisterType : { 'Model' : null },
      selectedModel,
      owner: [],
    };

    console.log("#######Debug createModel modelInput ", modelInput);
    const createModelResponse = await $store.aissemblyBackendActor.createNewCanister(modelInput);
    console.log("#######Debug createModel createModelResponse ", createModelResponse);
    // @ts-ignore
    if (createModelResponse.Err) {
      modelCreationError = true;
    } else {
      // @ts-ignore
      createdModelCanisterId = createModelResponse.Ok.newCanisterId;
      $currentAiCreationObject.createdBackendCanisterId = createdModelCanisterId;
      modelCreationSuccess = true;
    };
    modelCreationInProgress = false;
  };

</script>

<section class="bg-white dark:bg-gray-900 bg-[url('/images/hero-pattern.svg')]">
  <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
    <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
      Create Your AI model</h1>
    {#if modelCreationSuccess}
      <div class="text-gray-800 dark:text-gray-200">
        <h3>AI Model Created</h3>
        <span class="inline-block break-all">
          <p>The canister Id is {createdModelCanisterId}.</p>
        </span>
      </div>
    {:else}
      <div class="space-y-2 text-gray-800 dark:text-gray-200">
        <p class="mt-4">Let's double-check that all AI model details are looking good before creating it.</p>
        <p>Selected AI Model: {$currentAiCreationObject.llm.selectedModel}</p>
        {#if validationErrors.length}
          <p class="mt-4">Please correct the following details:</p>
          <ul class="text-red-500 dark:text-red-400">
            {#each validationErrors as error}
              <li>{error}</li>
            {/each}
          </ul>
          <button disabled class="opacity-50 cursor-not-allowed bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-700">
            Create My AI!
          </button>
        {:else if !$store.isAuthed}
          <div>
            <p>Please note that you may only create your AI model if you log in (such that you become its owner).</p>
          </div>
        {:else}
          <p class="mt-4">Great, everything is in place! If you're ready, you can finalize the donation now.</p>
          {#if modelCreationInProgress}
            <button disabled class="opacity-50 cursor-not-allowed bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-700">
              Create My AI!
            </button>
            <img class="h-12 mx-auto p-2" src={spinner} alt="loading animation" />
          {:else}
            <button on:click|preventDefault={createModel} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" >
              Create My AI!
            </button>
          {/if}
        {/if}
        {#if modelCreationError}
          <div class="text-red-500 dark:text-red-400">
            <p class="mt-4">Unfortunately, there was an error. Please try again.</p>
          </div>
        {/if}
      </div>      
    {/if}
  </div>
</section>