import { DynamicTool } from "langchain/tools";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TextLoader } from "langchain/document_loaders/fs/text";

// Import @tensorflow/tfjs-core
import * as tf from '@tensorflow/tfjs-core';
// Adds the WebGL backend to the global backend registry.
import '@tensorflow/tfjs-backend-webgl';
import { TensorFlowEmbeddings } from "langchain/embeddings/tensorflow";

import {
  store,
  vectorStore,
} from "../store";

let storeState;
store.subscribe((value) => storeState = value);

let vectorStoreState;
vectorStore.subscribe((value) => vectorStoreState = value);

let providedDataEntries;

/**
 * Interface representing a vector in memory. It includes the content
 * (text), the corresponding embedding (vector), and any associated
 * metadata.
 */ 
// from https://github.com/langchain-ai/langchainjs/blob/ad2da871c50728712fb913f9c68d1fe77084911e/langchain/src/vectorstores/memory.ts#L11
interface MemoryVector {
  content: string;
  embedding: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
};

// https://js.langchain.com/docs/modules/agents/tools/how_to/dynamic
// https://github.com/langchain-ai/langchainjs/issues/1115
export const getSearchVectorDbTool = () => {
  const vectorDbSearchToolName = "search-vector-database";
  const vectorDbSearchToolDescription = "Limited data: Tool to find previously stored data in the local vector database. The input must be a text string representing the search query. Note that this local database is limited and that while the returned results are the closest matches to the search query in the local database they are not necessarily good enough to show to the user. Never make up any new entries.";

  const vectorDbSearchTool = new DynamicTool({
    name: vectorDbSearchToolName,
    description: vectorDbSearchToolDescription,
    func: async (toolInput: string) => {
      console.log("Debug vectorDbSearchTool typeof toolInput ", typeof toolInput);
      console.log("Debug vectorDbSearchTool typeof toolInput !== 'string' ", typeof toolInput !== 'string');
      if (toolInput === undefined || typeof toolInput !== 'string') {
        return "There is an input error. You must input a text string as search query for the data in the local vector database.";
      };
      const response = await searchEmbeddings(toolInput);
      const toolResponse = {
        importantNoteOnResult: "These are the most relevant data points found which does not mean they are great matches as the local vector database is limited. You should check that they actually match what the user asked for. If so you may consider showing them to the user, otherwise consider going on without an data from this database, trying another input query or using other tools. Never make up any data.",
        existingChatsFoundInLocalDatabase: response,
      };
      return JSON.stringify(toolResponse);
    },
  });
  generateEmbeddings();
  return vectorDbSearchTool;
}; 

const generateEmbeddings = async () => {
  console.log("Debug generateEmbeddings");
  try {
    const start = performance.now() / 1000;

    const existingDataEntries = await getDataEntries();
    providedDataEntries = existingDataEntries;

    const textsToEmbed = existingDataEntries.map(
      (dataEntry) => JSON.stringify(dataEntry)
    );
    console.log("Debug generateEmbeddings textsToEmbed ", textsToEmbed);

    const metadata = existingDataEntries.map((dataEntry) => ({ id: dataEntry.id }));
    console.log("Debug generateEmbeddings metadata ", metadata);

    //const embeddings = new OpenAIEmbeddings({ openAIApiKey: "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" });
    const embeddings = new TensorFlowEmbeddings();

    console.log("Debug generateEmbeddings embeddings ", embeddings);

    vectorStoreState = await MemoryVectorStore.fromTexts(
      textsToEmbed,
      metadata,
      embeddings,
    );
    /* const loader = new TextLoader("unconventionsagainstcorruptionpdf.pdf");
    const loader = new TextLoader("../assets/test.txt");
    const docs = await loader.load();
    console.log("Debug generateEmbeddings docs ", docs);
    vectorStoreState = await MemoryVectorStore.fromDocuments(
      docs,
      embeddings,
    );
    console.log("Debug generateEmbeddings vectorStoreState ", vectorStoreState);
    const loader2 = new TextLoader("unpolicy_guide_full.pdf");
    const docs2 = await loader2.load();
    vectorStoreState.addDocuments(docs2); */
    vectorStore.set(vectorStoreState);
    console.log("Debug generateEmbeddings vectorStoreState ", vectorStoreState);
    console.log("Debug generateEmbeddings vectorStoreState.memoryVectors ", vectorStoreState.memoryVectors);
    const memVecs = vectorStoreState.memoryVectors;
    console.log("Debug generateEmbeddings memVecs ", memVecs);
    // Store memoryVectors for user
    try {
      const storeMemoryVectorsResponse = await storeState.backendActor.store_user_chats_memory_vectors(memVecs);
      console.log("Debug generateEmbeddings storeMemoryVectorsResponse ", storeMemoryVectorsResponse);
    } catch (error) {
      console.error("Error storing memory vectors: ", error);        
    };
    // Debug
    let retrievedMemVecs = [];
    try {
      const getMemoryVectorsResponse = await storeState.backendActor.get_caller_memory_vectors();
      console.log("Debug generateEmbeddings getMemoryVectorsResponse ", getMemoryVectorsResponse);
      if (getMemoryVectorsResponse.Ok) {
        retrievedMemVecs = getMemoryVectorsResponse.Ok;
      };
    } catch (error) {
      console.error("Error retrieving memory vectors: ", error);        
    };
    //vectorStoreState.memoryVectors = retrievedMemVecs;
    console.log("Debug generateEmbeddings vectorStoreState.memoryVectors after retrievedMemVecs ", vectorStoreState.memoryVectors);

    const end = performance.now() / 1000; // Debug

    console.log(`Debug: Took ${(end - start).toFixed(2)}s`)
  } catch (error) {
    console.error(error)
  };
};

const searchEmbeddings = async (text: string) => {
  console.log("Debug searchEmbeddings text ", text);
  try {
    if (!vectorStoreState) {
      await generateEmbeddings();
    };

    const searchResult = await vectorStoreState.similaritySearch(text, 2); // returns 2 entries
    console.log("Debug searchEmbeddings searchResult ", searchResult);

    /* results.forEach((r) => {
      console.log(r.pageContent.match(/Title:(.*)/)?.[0]) // Use regex to extract the title from the result text
    }); */
    const searchResultIds = searchResult.map((r) => r.metadata.id);
    console.log("Debug searchEmbeddings searchResultIds ", searchResultIds);
    let results = providedDataEntries.filter((dataEntry) => searchResultIds.includes(dataEntry.id));
    console.log("Debug searchEmbeddings results ", results);
    return results;
  } catch (error) {
    console.error(error)
  };
};

const getDataEntries = async () => {
  console.log("Debug getDataEntries");
  const dataEntries = [];
  for (let index = 0; index < knowledgePages.length; index++) {
    const dataEntry = {
      id: index,
      content: knowledgePages[index]
    };
    dataEntries.push(dataEntry);      
  };
  
  return dataEntries;
};

const knowledgePages = [
  `The States Parties to this Convention,
  Concerned about the seriousness of problems and threats posed by corruption
  to the stability and security of societies, undermining the institutions and
  values of democracy, ethical values and justice and jeopardizing sustainable
  development and the rule of law,
  Concerned also about the links between corruption and other forms of
  crime, in particular organized crime and economic crime, including moneylaundering,
  Concerned further about cases of corruption that involve vast quantities of
  assets, which may constitute a substantial proportion of the resources of States,
  and that threaten the political stability and sustainable development of those
  States,`,
  `Convinced that corruption is no longer a local matter but a transnational
  phenomenon that affects all societies and economies, making international cooperation
  to prevent and control it essential,
  Convinced also that a comprehensive and multidisciplinary approach is
  required to prevent and combat corruption effectively,
  Convinced further that the availability of technical assistance can play an
  important role in enhancing the ability of States, including by strengthening
  capacity and by institution-building, to prevent and combat corruption
  effectively,
  Convinced that the illicit acquisition of personal wealth can be particularly
  damaging to democratic institutions, national economies and the rule of law,
  Annex`
];