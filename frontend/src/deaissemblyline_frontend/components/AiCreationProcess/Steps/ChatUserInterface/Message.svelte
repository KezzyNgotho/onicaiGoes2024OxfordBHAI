<script lang="ts">
  export let message;
</script>

<div class="message">
  <p class="text-gray-900 dark:text-white"><strong>{message.sender}</strong></p>
  <p class="text-gray-900 dark:text-white">{message.content}</p>
</div>

<style>
  .message {
    margin-bottom: 10px;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
  }
</style>
