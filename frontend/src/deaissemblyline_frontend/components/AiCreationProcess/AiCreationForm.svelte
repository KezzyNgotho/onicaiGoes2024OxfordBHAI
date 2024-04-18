<script>
	import SelectionStep from './Steps/Selection/SelectionStep.svelte';
	import InfoStep from './Steps/Info/InfoStep.svelte';
	import CreateModelStep from './Steps/CreateModel/CreateModelStep.svelte';
	import ModelConfirmationStep from './Steps/ModelConfirmation/ModelConfirmationStep.svelte';
	import ChatUserInterfaceStep from './Steps/ChatUserInterface/ChatUserInterfaceStep.svelte';

	export let active_step;
	
	const handleSubmit = () => {
		console.log("form submitted");
	};

</script>

<form class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center max-w-full mx-auto" on:submit={handleSubmit}>
	{#if active_step == 'Select'}
		<SelectionStep />
	{:else if active_step == 'Info'}
		<InfoStep />
	{:else if active_step == 'Create'}
		<CreateModelStep />
    {:else if active_step == 'Result'}
  		<ModelConfirmationStep />
	{:else if active_step == 'Use'}
		<ChatUserInterfaceStep />
	{/if}
</form>