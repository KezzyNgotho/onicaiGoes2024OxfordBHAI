<script lang="ts">
  import { writable } from "svelte/store";
  import * as webllm from "@mlc-ai/web-llm";
  import { chatModelGlobal, chatModelDownloadedGlobal, activeChatGlobal, selectedAiModelId } from "../store";
  import Button from "./Button.svelte";
  import ChatBox from "./ChatBox.svelte";
  import { modelConfig } from "../helpers/gh-config";
  import { getSearchVectorDbTool } from "../helpers/vector_database";

  import spinner from "../assets/loading.gif";

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

    $chatModelDownloadedGlobal = true;
    chatModelDownloadInProgress = false;
  };

  const generateProgressCallback = (_step: number, message: string) => {
    setLabel("generate-label", message);
  };

  async function getChatModelResponse(prompt, progressCallback = generateProgressCallback) {
    checkAndCompleteTopic(prompt); // Check whether the prompt contributes to the user completing the current topic

    let additionalContentToProvide = "Additional official United Nations resources:";
    if (vectorDbSearchTool) {
      let vectorDbSearchToolResponse = await vectorDbSearchTool.func(prompt);
      vectorDbSearchToolResponse = JSON.parse(vectorDbSearchToolResponse);

      for (let index = 0; index < vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase.length; index++) {
        const additionalEntry = vectorDbSearchToolResponse.existingChatsFoundInLocalDatabase[index];
        additionalContentToProvide += "  ";
        additionalContentToProvide += additionalEntry.content;  
      };
    };

    // Compose the final prompt, focusing primarily on the user's query
    let finalPrompt = "If highly relevant, you may also use: " + additionalContentToProvide;
    finalPrompt = "USER PROMPT: " + prompt + "\n" + finalPrompt;

    const reply = await $chatModelGlobal.generate(finalPrompt, progressCallback);
    return reply;
  };

// User can select between topics (a different vector database is used per topic)
  let selectedTopic = '';
  let loadingKnowledgeDatabase = false;

  async function changeTopic() {
    loadingKnowledgeDatabase = true;
    vectorDbSearchTool = null;
    vectorDbSearchTool = await getSearchVectorDbTool(selectedTopic);
    loadingKnowledgeDatabase = false;
  };
  
  let topicsCompleted = writable(new Set());
  $: allTopicsCompleted = $topicsCompleted.size === 5;

  const suggestedQuestions = {
    unMaterial1: "What are the most important statements about anti-corruption in the UN Convention?",
    unMaterial2: "Which actions should leaders take to engage young people in the fight against corruption?",
    unMaterial3: "How can young people contribute to anti-corruption initiatives today?",
    unMaterial4: "How does this theatre play highlight the importance of the law?",
    unMaterial5: "Why should you care about corruption and the work against it?"
  };

  const numberOfTopics = Object.keys(suggestedQuestions).length;

  async function askQuestion() {
    if (!selectedTopic || selectedTopic === '') {
      return;
    };
    const question = suggestedQuestions[selectedTopic];
    await getChatModelResponse(question);
    topicsCompleted.update(set => {
      set.add(selectedTopic);
      return set;
    });
  };

  async function copyQuestionToClipboard() {
    if (!selectedTopic || selectedTopic === '') {
      return;
    };
    const question = suggestedQuestions[selectedTopic];
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(question).then(() => {
        console.log('Question copied to clipboard!');
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    };
  };

  function checkAndCompleteTopic(prompt) {
    if (!selectedTopic || selectedTopic === '') {
      return;
    };
    if (prompt === suggestedQuestions[selectedTopic]) {
      topicsCompleted.update(set => {
        set.add(selectedTopic);
        return set;
      });
    };
  };

// User can select between chats (global variable is kept)
  async function showNewChat() {
    $activeChatGlobal = null;
    return;
  };
</script>

<section id="chat-model-section" class="py-7 space-y-6 items-center text-center bg-slate-100 dark:bg-slate-800">
  <h1 class="mb-4 text-xl font-bold tracking-tight leading-none text-gray-900 md:text-xl lg:text-xl dark:text-white">
    Your AI Assistant to Learn With</h1>
  <h3 class="text-gray-900 dark:text-gray-200">Discuss the actions the United Nations is taking against corruption as well as any other topics you're interested in.</h3>
  {#if chatModelDownloaded}
    <h3 id='chatModelStatusSubtext' class="text-gray-900 dark:text-gray-200">Success! You can chat with your AI Assistant now.</h3>
    <!-- <Button id="newChatButton"
        class="bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-900"
        on:click={showNewChat}>New Chat</Button> -->
    <p id="generate-label" class="text-gray-900 dark:text-gray-200"> </p>
    <div class="p-4">
      <h3 class="mb-1 text-gray-900 dark:text-gray-200">You can select a specific topic you'd like to learn about here. This will then load the United Nations Knowledge Base for this topic:</h3>
      {#if allTopicsCompleted}
        <p class="mb-2 text-gray-900 dark:text-gray-200">Congratulations! You have completed learning about all the topics.</p>
      {:else}
        <p class="mb-2 text-gray-900 dark:text-gray-200">Exciting, you've got {numberOfTopics - $topicsCompleted.size} {(numberOfTopics - $topicsCompleted.size) === 1 ? "topic" : "topics"} left to learn about.</p>
      {/if}
      <!-- Dropdown for selecting topics -->
      <select bind:value={selectedTopic} on:change="{() => changeTopic()}" class="mb-2 text-gray-900 dark:text-gray-200 w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline">
        <option value="unMaterial1" class="mb-2 text-gray-900 dark:text-gray-200">UNITED NATIONS CONVENTION AGAINST CORRUPTION</option>
        <option value="unMaterial2" class="mb-2 text-gray-900 dark:text-gray-200">POLICY GUIDE FOR NATIONAL ANTI-CORRUPTION AUTHORITIES ON MEANINGFUL YOUTH ENGAGEMENT IN ANTI-CORRUPTION WORK</option>
        <option value="unMaterial3" class="mb-2 text-gray-900 dark:text-gray-200">YouthLED TALKS</option>
        <option value="unMaterial4" class="mb-2 text-gray-900 dark:text-gray-200">A TEACHER’S GUIDE TO USING FORUM THEATRE TO PROMOTE THE RULE OF LAW</option>
        <option value="unMaterial5" class="mb-2 text-gray-900 dark:text-gray-200">UNIVERSITY MODULE SERIES ON ANTI-CORRUPTION</option>
      </select>

      <div class="p-4">
        {#if selectedTopic && selectedTopic !== ''}
          {#if $topicsCompleted.has(selectedTopic)}
            <p class="mb-2 text-gray-900 dark:text-gray-200">Great, you have completed this topic already. Feel free to talk to the AI assistant more about it.</p>
          {:else}
            <p class="mb-2 text-gray-900 dark:text-gray-200">Ask this Question to Complete the Topic:</p>
            <p class="mb-2 text-gray-900 dark:text-gray-200">{suggestedQuestions[selectedTopic]}</p>
            <button on:click="{() => copyQuestionToClipboard()}" class="bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-900 border-2 border-black dark:border-white">Copy Question</button>
          {/if}
        {:else}
          <p class="mb-2 text-gray-900 dark:text-gray-200">Please select a topic to see your learning progress.</p>
        {/if}
      </div>
    </div>
    {#key $activeChatGlobal}  <!-- Element to rerender everything inside when activeChat changes (https://www.webtips.dev/force-rerender-components-in-svelte) -->
      <ChatBox modelCallbackFunction={getChatModelResponse} chatDisplayed={$activeChatGlobal} />
    {/key}
  {:else}
    {#if chatModelDownloadInProgress}
      <h3 id='chatModelStatusSubtext' class="text-gray-900 dark:text-gray-200">Initializing Your AI Assistant. This may take a moment...</h3>
      <p id="init-label" class="text-gray-900 dark:text-gray-200"> </p>
    {:else}
      <h3 id='chatModelStatusSubtext' class="text-gray-900 dark:text-gray-200">Let's first get the AI Assistant ready for you. Please click on the button:</h3>
      <Button id="downloadChatModelButton"
        class="bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-900"
        on:click={loadChatModel}>Initialize</Button>
    {/if}
    <p class="text-red-900 dark:text-red-200">Note: If this is your first time initializing the AI assistant, then the app will download it into your browser which may take a few minutes. This will download a lot of data (so you might prefer being on a Wi-Fi connection for this)!</p>
    <p class="text-gray-900 dark:text-gray-200">If you have already initialized the AI assistant before, we can load the AI assistant directly from your browser which is much faster.</p>
    <p class="text-gray-900 dark:text-gray-200">AI assistants are pretty huge and require quite some computational resources. 
      As this AI assistant runs on your device (via the browser), whether and how fast it may run depend on the device's hardware. If a given model doesn't work, you can try a smaller one from the selection under Settings and see if the device can support it.</p>
    <p class="text-gray-900 dark:text-gray-200">For the best possible experience, we recommend running as few other programs and browser tabs as possible besides this one as those can limit the computational resources available for the AI assistant.</p>
  {/if}
  {#if loadingKnowledgeDatabase}
    <p class="text-gray-900 dark:text-gray-200">Loading the United Nations Knowledge Base for you...</p>
    <img class="h-12 mx-auto p-1 block" src={spinner} alt="loading animation" />
  {/if}
  <!-- <p id="debug-label"> </p>  Debug -->
</section>
