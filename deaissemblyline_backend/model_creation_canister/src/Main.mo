import Buffer "mo:base/Buffer";
import D "mo:base/Debug";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Time "mo:base/Time";
import Int "mo:base/Int";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Cycles "mo:base/ExperimentalCycles";

import Types "Types";
import Utils "Utils";

actor class ModelCreationCanister(_master_canister_id : Text) = this {

    // TODO: This is not used, but removing it brakes deployment. Don't understand yet why...
    let MASTER_CANISTER_ID : Text = _master_canister_id; // Corresponds to DeAIssembly Backend canister

    // -------------------------------------------------------------------------------
    // Orthogonal Persisted Data storage

    // Map each AI model id to a record with the artefacts needed to create a new canister
    private var creationArtefactsByModel = HashMap.HashMap<Text, Types.ModelCreationArtefacts>(0, Text.equal, Text.hash);
    stable var creationArtefactsByModelStable : [(Text, Types.ModelCreationArtefacts)] = [];

    // -------------------------------------------------------------------------------
    // Canister Endpoints

    public shared (msg) func whoami() : async Principal {
        return msg.caller;
    };

    public shared (msg) func amiController() : async Types.AuthRecordResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };
        let authRecord = { auth = "You are a controller of this canister." };
        return #Ok(authRecord);
    };

    let IC0 : Types.IC_Management = actor ("aaaaa-aa");

    private func getModelCreationArtefacts(selectedModel : Types.AvailableModels) : ?Types.ModelCreationArtefacts {
        switch (selectedModel) {
            case (#Llama2_260K) {
                let creationArtefacts : ?Types.ModelCreationArtefacts = creationArtefactsByModel.get("Llama2_260K"); // TODO 260K
                return creationArtefacts;
            };
            case (#Llama2_15M) {
                let creationArtefacts : ?Types.ModelCreationArtefacts = creationArtefactsByModel.get("Llama2_15M"); // TODO 15M
                return creationArtefacts;
            };
            case _ { return null };
        };
    };

    // Admin function to insert needed artefacts to create canisters for a new model type
    // TODO: insert artefacts for 260K model
    // TODO: insert artefacts for 15M model; private stable var llama2_15M_wasm : Blob = "\de\ad\be\ef"; // TODO etc
    public shared (msg) func addModelCreationArtefactsEntry(modelId : Text, creationArtefacts : Types.ModelCreationArtefacts) : async Types.InsertArtefactsResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };
        let creationArtefactsResult = creationArtefactsByModel.put(modelId, creationArtefacts);
        let result = creationArtefactsByModel.get(modelId);
        switch (result) {
            case (?newArtefacts) {
                return #Ok(newArtefacts);
            };
            case _ { return #Err(#Other("Adding the artefacts failed.")) };
        };
    };

    // Admin function to upload a canister wasm file
    public shared (msg) func upload_wasm_bytes_chunk(modelId : Text, bytesChunk : [Nat8]) : async Types.FileUploadResult {
        D.print("Entered upload_wasm_bytes_chunk");
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        switch (creationArtefactsByModel.get(modelId)) {
            case (?existingArtefacts) {
                let updatedArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = Array.append(existingArtefacts.canisterWasm, bytesChunk);
                    modelWeights = existingArtefacts.modelWeights;
                    tokenizer = existingArtefacts.tokenizer;
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, updatedArtefacts);

                return #Ok({ creationResult = "Success" });
            };
            case _ {
                // new entry
                let newArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = bytesChunk;
                    modelWeights = [];
                    tokenizer = [];
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, newArtefacts);
                return #Ok({ creationResult = "New entry created" });
            };
        };
    };

    // Admin function to upload a model file
    public shared (msg) func upload_model_bytes_chunk(modelId : Text, bytesChunk : [Nat8]) : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        switch (creationArtefactsByModel.get(modelId)) {
            case (?existingArtefacts) {
                let updatedArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = existingArtefacts.canisterWasm;
                    modelWeights = Array.append(existingArtefacts.modelWeights, bytesChunk);
                    tokenizer = existingArtefacts.tokenizer;
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, updatedArtefacts);

                return #Ok({ creationResult = "Success" });
            };
            case _ { return #Err(#Other("Add the canisterWasm first.")) };
        };
    };

    // Admin function to upload a tokenizer file
    public shared (msg) func upload_tokenizer_bytes_chunk(modelId : Text, bytesChunk : [Nat8]) : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        switch (creationArtefactsByModel.get(modelId)) {
            case (?existingArtefacts) {
                let updatedArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = existingArtefacts.canisterWasm;
                    modelWeights = existingArtefacts.modelWeights;
                    tokenizer = Array.append(existingArtefacts.tokenizer, bytesChunk);
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, updatedArtefacts);

                return #Ok({ creationResult = "Success" });
            };
            case _ { return #Err(#Other("Add the canisterWasm.")) };
        };
    };

    // Admin function to upload control canister wasm
    private stable var controlCanisterWasm : [Nat8] = [];

    public shared (msg) func upload_control_wasm_bytes_chunk(bytesChunk : [Nat8]) : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        controlCanisterWasm := Array.append(controlCanisterWasm, bytesChunk);

        return #Ok({ creationResult = "Success" });
    };

    // Use with caution: Admin function to reset the control canister wasm
    public shared (msg) func reset_control_canister_wasm() : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        controlCanisterWasm := [];

        return #Ok({ creationResult = "Success" });
    };

    // Use with caution: Admin function to reset the creation artefacts for a model
    public shared (msg) func reset_model_creation_artefacts(modelId : Text) : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        creationArtefactsByModel.delete(modelId);

        return #Ok({ creationResult = "Success" });
    };

    // Spin up a new canister with an AI model running in it as specified by the input parameters
    public shared (msg) func createCanister(configurationInput : Types.ModelConfiguration) : async Types.ModelCreationResult {
        // Only backend canister may call this
        // if (not Principal.isController(msg.caller) or Principal.equal(msg.caller, Principal.fromActor(this))) {
        /* if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        }; */

        switch (getModelCreationArtefacts(configurationInput.selectedModel)) {
            case (?creationArtefacts) {
                // Create LLM canister
                Cycles.add(300_000_000_000);

                let createLlmCanister = await IC0.create_canister({
                    settings = ?{
                        freezing_threshold = null;
                        controllers = ?[Principal.fromActor(this), configurationInput.owner];
                        memory_allocation = null;
                        compute_allocation = null;
                    };
                });

                let install_wasm = await IC0.install_code({
                    arg = "";
                    wasm_module = Blob.fromArray(creationArtefacts.canisterWasm);
                    mode = #install;
                    canister_id = createLlmCanister.canister_id;
                });

                // Upload files (model and tokenizer)
                let modelCanister = actor (Principal.toText(createLlmCanister.canister_id)) : actor {
                    health : () -> async Types.StatusCodeRecordResult;
                    ready : () -> async Types.StatusCodeRecordResult;
                    reset_model : () -> async Types.StatusCodeRecordResult;
                    reset_tokenizer : () -> async Types.StatusCodeRecordResult;
                    upload_model_bytes_chunk : ([Nat8]) -> async Types.StatusCodeRecordResult;
                    upload_tokenizer_bytes_chunk : ([Nat8]) -> async Types.StatusCodeRecordResult;
                    initialize : () -> async Types.StatusCodeRecordResult;
                    set_canister_mode : (Text) -> async Types.StatusCodeRecordResult;
                    nft_init : (Types.NFTCollectionRecord) -> async Types.StatusCodeRecordResult;
                    nft_whitelist : (Types.NFTWhitelistRecord) -> async Types.StatusCodeRecordResult;
                };

                // TODO: chunk
                // let chunkSize = 42000; // ~0.01 MB for testing on 260K model
                let chunkSize = 9 * 1024 * 1024; // 9 MB

                let bufferTokenizer = Buffer.fromArray<Nat8>(creationArtefacts.tokenizer);
                let chunksTokenizer = Buffer.chunk<Nat8>(bufferTokenizer, chunkSize);
                for (chunk in chunksTokenizer.vals()) {
                    D.print("Uploading another chunk of the tokenizer...");
                    let uploadTokenizerResult = await modelCanister.upload_tokenizer_bytes_chunk(Buffer.toArray<Nat8>(chunk));
                };

                let bufferModel = Buffer.fromArray<Nat8>(creationArtefacts.modelWeights);
                let chunksModel = Buffer.chunk<Nat8>(bufferModel, chunkSize);
                for (chunk in chunksModel.vals()) {
                    D.print("Uploading another chunk of the model...");
                    let uploadModelResult = await modelCanister.upload_model_bytes_chunk(Buffer.toArray<Nat8>(chunk));
                };

                // let uploadTokenizerResult = await modelCanister.upload_tokenizer_bytes_chunk(creationArtefacts.tokenizer);
                // let uploadModelResult = await modelCanister.upload_model_bytes_chunk(creationArtefacts.modelWeights);

                // Initialize and check with call to ready
                let initializeResult = await modelCanister.initialize();
                let modeResultResult = await modelCanister.set_canister_mode("nft-ordinal");
                let nftInitResult = await modelCanister.nft_init({
                    nft_supply_cap = 0;
                    nft_total_supply = 0;
                    nft_symbol = "OXFORD";
                    nft_name = "OXFORD";
                    nft_description = "OXFORD HACKATHON";
                });
                // Not yet done with LLM canister, but first need to deploy the ctrlb_canister

                // Create control canister
                Cycles.add(300_000_000_000);

                let createControlCanister = await IC0.create_canister({
                    settings = ?{
                        freezing_threshold = null;
                        controllers = ?[Principal.fromActor(this), configurationInput.owner];
                        memory_allocation = null;
                        compute_allocation = null;
                    };
                });

                let installControlWasm = await IC0.install_code({
                    //arg = Text.encodeUtf8(Principal.toText(createLlmCanister.canister_id)); // TODO: pass LLM canister id as arg
                    arg = "";
                    wasm_module = Blob.fromArray(controlCanisterWasm);
                    mode = #install;
                    canister_id = createControlCanister.canister_id;
                });

                // Add LLM canister address to control canister
                let controlCanister = actor (Principal.toText(createControlCanister.canister_id)) : actor {
                    set_llm_canister_id : Types.CanisterIDRecord -> async Types.StatusCodeRecordResult;
                };

                let settingLlmIdResult = await controlCanister.set_llm_canister_id({
                    canister_id : Text = Principal.toText(createLlmCanister.canister_id);
                });

                // Add control canister as a controller of LLM canister
                await IC0.update_settings(({
                    canister_id = createLlmCanister.canister_id;
                    settings = {
                        controllers = ?[Principal.fromActor(this), configurationInput.owner, createControlCanister.canister_id];
                        freezing_threshold = null;
                        memory_allocation = null;
                        compute_allocation = null;
                    };
                }));

                // --------------------------------------------------------------------
                // Finish configuring the LLM canister
                D.print("Calling nft_whitelist for LLM canister");
                let nftWhitelistResult = await modelCanister.nft_whitelist({
                    id = createControlCanister.canister_id;
                    description = "ctrlb_canister";
                });
                let readyResult = await modelCanister.ready();

                switch (readyResult) {
                    case (#Err(error)) {
                        //return #Err(#Other("Creation failed."));
                        return #Err(error);
                    };
                    case _ {}; // LLM canister is ready
                };

                // --------------------------------------------------------------------
                let creationRecord = {
                    creationResult = "Success";
                    newCtlrbCanisterId = Principal.toText(createControlCanister.canister_id);
                    newLlmCanisterId = Principal.toText(createLlmCanister.canister_id);
                };
                return #Ok(creationRecord);
            };
            case _ { return #Err(#InvalidId) };
        };
    };

    public shared (msg) func testCreateCanister() : async Types.ModelCreationResult {
        /* if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        }; */
        let config = {
            selectedModel : Types.AvailableModels = #Llama2_260K;
            owner : Principal = msg.caller;
        };
        let result = await createCanister(config);
        return result;
    };
    public shared (msg) func testCreateCanister15M() : async Types.ModelCreationResult {
        /* if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        }; */
        let config = {
            selectedModel : Types.AvailableModels = #Llama2_15M;
            owner : Principal = msg.caller;
        };
        let result = await createCanister(config);
        return result;
    };
    // -------------------------------------------------------------------------------
    // Canister upgrades

    // System-provided lifecycle method called before an upgrade.
    system func preupgrade() {
        // Copy the runtime state back into the stable variable before upgrade.
        creationArtefactsByModelStable := Iter.toArray(creationArtefactsByModel.entries());
    };

    // System-provided lifecycle method called after an upgrade or on initial deploy.
    system func postupgrade() {
        // After upgrade, reload the runtime state from the stable variable.
        creationArtefactsByModel := HashMap.fromIter(Iter.fromArray(creationArtefactsByModelStable), creationArtefactsByModelStable.size(), Text.equal, Text.hash);
        creationArtefactsByModelStable := [];
    };
    // -------------------------------------------------------------------------------
};
