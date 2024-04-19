<script lang="ts">
  import { store, currentAiCreationObject } from "../../../../store";

  import Message from './Message.svelte';

  let newMessageText = '';
  let messages = [];

  let replyText = 'Thinking...';

  let messageGenerationInProgress = false;

  let showCreateModelFirstMessage = !$currentAiCreationObject.createdBackendCanisterId || $currentAiCreationObject.createdBackendCanisterId === "";

  const generateProgressCallback = (_step: number, message: string) => {
    replyText = message;
    messages = [...messages.slice(0, -1), { sender: 'Your AI', content: replyText }];
  };

  async function sendMessage() {
    console.log("Debug sendMessage ");
    if (!$store.isAuthed) {
      return;
    };
    if (!$currentAiCreationObject.createdBackendCanisterId || $currentAiCreationObject.createdBackendCanisterId === "") {
      showCreateModelFirstMessage = true;
    };
    messageGenerationInProgress = true;
    console.log("Debug sendMessage newMessageText ", newMessageText);
    if(newMessageText.trim() !== '') {
      messages = [...messages, { sender: 'You', content: newMessageText.trim() }];
      const newPrompt = newMessageText.trim();
      newMessageText = '';
      try {
        messages = [...messages, { sender: 'Your AI', content: replyText }];
        console.log("Debug sendMessage messages ", messages);
        let modelBackendCanister = await store.getActorForModelBackendCanister();
        console.log("Debug sendMessage modelBackendCanister ", modelBackendCanister);
        let steps = BigInt(30);
        let temperature = 0.1;
        let topp = 0.9;
        let rng_seed = BigInt(0);
        let promptInput = {
          prompt : newPrompt,
          rng_seed,
          steps,
          temperature,
          topp,
        };
        const reply = await modelBackendCanister.Inference(promptInput);
        console.log("Debug sendMessage reply ", reply);
        // @ts-ignore
        if (reply.Ok) {
          // @ts-ignore
          messages = [...messages.slice(0, -1), { sender: 'Your AI', content: reply.Ok.story }]; 
        } else {
          messages = [...messages, { sender: 'Your AI', content: "There was an error unfortunately. Please try again." }];
        };
      } catch (error) {
        console.error("Error getting response from model: ", error);
        messages = [...messages, { sender: 'Your AI', content: "There was an error unfortunately. Please try again." }];
      }
      replyText = 'Thinking...';
    }
    messageGenerationInProgress = false;
  };
</script>

<section class="bg-white dark:bg-gray-900 bg-[url('/images/hero-pattern.svg')]" >
  <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
    {#if !$store.isAuthed}
      <div>
        <p class="mb-2 text-gray-900 dark:text-white">Please log in first. You may only interact with your AI model if you're logged in (such that it knows it's you).</p>
      </div>
    {:else if showCreateModelFirstMessage}
      <div>
        <p class="mb-2 text-gray-900 dark:text-white">Please first create your AI model on the previous step. Then, you can interact with it here.</p>
      </div>
    {:else}
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Use Your Personal AI</h1>  
      <p class="mb-2 text-gray-900 dark:text-white">Write a prompt to your AI below and it will generate a response for you.</p>
      
      <div class="chatbox">
        <div class="messages">
          {#each messages as message (message.content)}
            <Message {message} />
          {/each}
        </div>

      <div class="message-input">
        <input bind:value={newMessageText} placeholder="Type your message here..." />
        {#if messageGenerationInProgress}
          <button disabled on:click={sendMessage}>Send</button>
        {:else}
          <button on:click={sendMessage}>Send</button>
        {/if}
      </div>
    </div>
    {/if}
  </div>
</section>


<style>
  .chatbox {
    width: 100%;
    height: 400px;
    border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
  }

  .messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .message-input {
    height: 60px;
    display: flex;
    padding: 10px;
    border-top: 1px solid #ccc;
  }

  .message-input input {
    height: 40px;
    flex-grow: 1;
    margin-right: 10px;
  }
</style>
