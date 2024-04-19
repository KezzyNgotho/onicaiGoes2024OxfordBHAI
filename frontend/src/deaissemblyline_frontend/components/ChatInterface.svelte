<script lang="ts">
  import * as webllm from "@mlc-ai/web-llm";
  import { chatModelGlobal, chatModelDownloadedGlobal, activeChatGlobal, selectedAiModelId } from "../store";
  import Button from "./Button.svelte";
  import ChatBox from "./ChatBox.svelte";
  import { modelConfig } from "../helpers/gh-config";
  import { getSearchVectorDbTool } from "../helpers/vector_database";

  const workerPath = './worker.ts';

  let chatModelDownloadInProgress = false;
  let chatModelDownloaded = false;
  chatModelDownloadedGlobal.subscribe((value) => chatModelDownloaded = value);

  let vectorDbSearchTool;

  // Debug Android
  //let debugOutput = "";

  function setLabel(id: string, text: string) {
    const label = document.getElementById(id);
    if (label == null) {
      throw Error("Cannot find label " + id);
    }
    label.innerText = text;
  }

  async function loadChatModel() {
    /* debugOutput += "###in loadChatModel###";
    setLabel("debug-label", debugOutput); */
    if (chatModelDownloadInProgress) {
      return;
    };
    if (chatModelDownloaded === true && $chatModelGlobal) {
      return;
    };
    //console.log("Loading chat model...");
    chatModelDownloadInProgress = true;
    if (process.env.NODE_ENV !== "development") {
      //console.log("Using web worker");
      try {
        /* TODO: fix
        chatModel = new webllm.ChatWorkerClient(new Worker(
          new URL(workerPath, import.meta.url),
          {type: 'module'}
        )); */
        $chatModelGlobal = new webllm.ChatModule();
      } catch (error) {
        console.error("Error loading web worker: ", error);
        $chatModelGlobal = new webllm.ChatModule();
      }      
    } else {
      //console.log("Using webllm");
      $chatModelGlobal = new webllm.ChatModule();
    }

    $chatModelGlobal.setInitProgressCallback((report: webllm.InitProgressReport) => {
      setLabel("init-label", report.text);
    });
    await $chatModelGlobal.reload($selectedAiModelId, undefined, modelConfig);

    vectorDbSearchTool = getSearchVectorDbTool();

    $chatModelDownloadedGlobal = true;
    chatModelDownloadInProgress = false;
  };

  const generateProgressCallback = (_step: number, message: string) => {
    setLabel("generate-label", message);
  };

  async function getChatModelResponse(prompt, progressCallback = generateProgressCallback) {
    console.log("######################################Debug getChatModelResponse prompt ", prompt);
    console.log("######################################Debug getChatModelResponse vectorDbSearchTool ", vectorDbSearchTool);
    console.log("######################################Debug getChatModelResponse vectorDbSearchTool.name ", vectorDbSearchTool.name);
    console.log("######################################Debug getChatModelResponse vectorDbSearchTool.description ", vectorDbSearchTool.description);
    console.log("######################################Debug getChatModelResponse vectorDbSearchTool.func ", vectorDbSearchTool.func);
    let vectorDbSearchToolResponse = await vectorDbSearchTool.func(prompt);
    console.log("######################################Debug getChatModelResponse vectorDbSearchTool.func() ", vectorDbSearchToolResponse);
    vectorDbSearchToolResponse = JSON.parse(vectorDbSearchToolResponse);
    console.log("######################################Debug getChatModelResponse vectorDbSearchToolResponse ", vectorDbSearchToolResponse);
    console.log("######################################Debug getChatModelResponse vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase ", vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase);
    console.log("######################################Debug getChatModelResponse vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase.length ", vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase.length);
    let additionalContentToProvide = " Additional official UN resources: (use these if possible but ignore this if not relevant): ";
    for (let index = 0; index < vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase.length; index++) {
      const additionalEntry = vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase[index];
      additionalContentToProvide += "  ";
      additionalContentToProvide += additionalEntry.content;  
    };
    console.log("######################################Debug getChatModelResponse additionalContentToProvide ", additionalContentToProvide);
    prompt = "User Prompt: " + prompt + additionalContentToProvide;
    console.log("######################################Debug getChatModelResponse prompt full ", prompt);

    const reply = await $chatModelGlobal.generate(prompt, progressCallback);
    console.log("#################################Debug getChatModelResponse reply ", reply);
    return reply;
  };

// User can select between chats (global variable is kept)
  async function showNewChat() {
    $activeChatGlobal = null;
    return;
  };
</script>

<section id="chat-model-section" class="py-7 space-y-6 items-center text-center bg-slate-100">
  <h1 class="mb-4 text-xl font-bold tracking-tight leading-none text-gray-900 md:text-xl lg:text-xl dark:text-white">
    Your AI Assistant to Learn With</h1>
  <h3>Discuss the United Nations' anti-corruption actions and any other topics you're interested in.</h3>
  {#if chatModelDownloaded}
    <h3 id='chatModelStatusSubtext'>Success! You can chat with your AI Assistant now.</h3>
    <!-- <Button id="newChatButton"
        class="bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-900"
        on:click={showNewChat}>New Chat</Button> -->
    <p id="generate-label"> </p>
    {#key $activeChatGlobal}  <!-- Element to rerender everything inside when activeChat changes (https://www.webtips.dev/force-rerender-components-in-svelte) -->
      <ChatBox modelCallbackFunction={getChatModelResponse} chatDisplayed={$activeChatGlobal} />
    {/key}
  {:else}
    {#if chatModelDownloadInProgress}
      <h3 id='chatModelStatusSubtext'>Downloading AI Assistant. This may take a moment...</h3>
      <p id="init-label"> </p>
    {:else}
      <h3 id='chatModelStatusSubtext'>Let's first download the AI Assistant for you. Please click on the button:</h3>
      <Button id="downloadChatModelButton"
        class="bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-900"
        on:click={loadChatModel}>Initialize</Button>
    {/if}
    <p>Note: AI assistants are pretty huge and require quite some computational resources. 
      As this AI assistant runs on your device (via the browser), whether and how fast it may run depend on the device's hardware. If a given model doesn't work, you can try a smaller one from the selection under Settings and see if the device can support it.</p>
    <p>For the best possible experience, we recommend running as few other programs and browser tabs as possible besides this one as those can limit the computational resources available for the AI assistant.</p>
  {/if}
  <!-- <p id="debug-label"> </p>  Debug -->
</section>
