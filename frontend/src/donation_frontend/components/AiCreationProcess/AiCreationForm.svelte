<script>
	import SelectionStep from './Steps/SelectionStep.svelte';
	import InfoStep from './Steps/InfoStep.svelte';
	import CreateModelStep from './Steps/CreateModelStep.svelte';
	import ModelConfirmationStep from './Steps/ModelConfirmationStep.svelte';
	import ChatUserInterfaceStep from './Steps/ChatUserInterfaceStep.svelte';

	export let active_step;
	
	const handleSubmit = () => {
		console.log("form submitted");
	};

</script>

<form class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center max-w-full mx-auto" on:submit={handleSubmit}>
	{#if active_step == 'Selection'}
		<SelectionStep />
	{:else if active_step == 'Info'}
		<InfoStep />
	{:else if active_step == 'CreateModel'}
		<CreateModelStep />
    {:else if active_step == 'ModelConfirmation'}
  		<ModelConfirmationStep />
	{:else if active_step == 'ChatUserInterface'}
		<ChatUserInterfaceStep />
	{/if}
</form>