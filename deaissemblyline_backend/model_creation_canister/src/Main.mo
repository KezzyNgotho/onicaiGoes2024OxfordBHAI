import Buffer "mo:base/Buffer";
import D "mo:base/Debug";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Nat64 "mo:base/Nat64";
import Time "mo:base/Time";
import Int "mo:base/Int";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Cycles "mo:base/ExperimentalCycles";

import Types "Types";
import Utils "Utils";

actor class ModelCreationCanister(_master_canister_id : Text) = this {

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
        switch(selectedModel) {
            case (#Llama2_260K) {
                let creationArtefacts : ?Types.ModelCreationArtefacts = creationArtefactsByModel.get("Llama2_260K"); // TODO 260K
                return creationArtefacts;
            };
            case (#Llama2_15M) {
                let creationArtefacts : ?Types.ModelCreationArtefacts = creationArtefactsByModel.get("Llama2_15M"); // TODO 15M
                return creationArtefacts;
            };
            case _ { return null; };
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
        switch(result) {
            case (?newArtefacts) {
                return #Ok(newArtefacts);
            };
            case _ { return #Err(#Other("Adding the artefacts failed.")); };
        };
    };

// Admin function to upload a canister wasm file
    public shared (msg) func upload_wasm_bytes_chunk(modelId : Text, bytesChunk: [Nat8]) : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        switch(creationArtefactsByModel.get(modelId)) {
            case (?existingArtefacts) {
                let updatedArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = Array.append(existingArtefacts.canisterWasm, bytesChunk);
                    modelWeights = existingArtefacts.modelWeights;
                    tokenizer = existingArtefacts.tokenizer;
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, updatedArtefacts);

                return #Ok({creationResult = "Success"});
            };
            case _ {
                // new entry
                let newArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = bytesChunk;
                    modelWeights = [];
                    tokenizer = [];
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, newArtefacts);
                return #Ok({creationResult = "New entry created"});
            };
        };
    };

// Admin function to upload a model file
    public shared (msg) func upload_model_bytes_chunk(modelId : Text, bytesChunk: [Nat8]) : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        switch(creationArtefactsByModel.get(modelId)) {
            case (?existingArtefacts) {
                let updatedArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = existingArtefacts.canisterWasm;
                    modelWeights = Array.append(existingArtefacts.modelWeights, bytesChunk);
                    tokenizer = existingArtefacts.tokenizer;
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, updatedArtefacts);

                return #Ok({creationResult = "Success"});
            };
            case _ { return #Err(#Other("Add the canisterWasm first.")); };
        };
    };

// Admin function to upload a tokenizer file
    public shared (msg) func upload_tokenizer_bytes_chunk(modelId : Text, bytesChunk: [Nat8]) : async Types.FileUploadResult {
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        switch(creationArtefactsByModel.get(modelId)) {
            case (?existingArtefacts) {
                let updatedArtefacts : Types.ModelCreationArtefacts = {
                    canisterWasm = existingArtefacts.canisterWasm;
                    modelWeights = existingArtefacts.modelWeights;
                    tokenizer = Array.append(existingArtefacts.tokenizer, bytesChunk);
                };

                let updateArtefactsResult = creationArtefactsByModel.put(modelId, updatedArtefacts);

                return #Ok({creationResult = "Success"});
            };
            case _ { return #Err(#Other("Add the canisterWasm.")); };
        };
    };

// Spin up a new canister with an AI model running in it as specified by the input parameters
    public shared (msg) func createCanister(configurationInput : Types.ModelConfiguration) : async Types.ModelCreationResult {
        // Only backend canister may call this
        if (not Principal.isController(msg.caller)) {
            return #Err(#Unauthorized);
        };

        switch(getModelCreationArtefacts(configurationInput.selectedModel)) {
            case (?creationArtefacts) {
                Cycles.add(300_000_000_000);

                let create_canister = await IC0.create_canister({
                    settings = ?{
                        freezing_threshold = null;
                        controllers = ?[Principal.fromActor(this), configurationInput.owner];
                        memory_allocation = null;
                        compute_allocation = null;
                    }
                });

                let install_wasm = await IC0.install_code({
                    arg = ""; // TODO
                    wasm_module = Blob.fromArray(creationArtefacts.canisterWasm);
                    mode = #install;
                    canister_id = create_canister.canister_id;
                });

                // TODO: upload files (model and tokenizer)


                // TODO: initialize and check with call to ready


                let creationRecord = {
                    creationResult = "Success";
                    newCanisterId = Principal.toText(create_canister.canister_id);
                };
                return #Ok(creationRecord);
            };
            case _ { return #Err(#InvalidId); };
        };
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
