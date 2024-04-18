<script>
	import { currentAiCreationObject } from "../../store";
  
	let modelType = $currentAiCreationObject.llm.selectedModel;
  </script>
  
  <div>
	<p>The model type <strong>{modelType}</strong> is not supported.</p>
	<p>Please select a different model type.</p>
  </div>  