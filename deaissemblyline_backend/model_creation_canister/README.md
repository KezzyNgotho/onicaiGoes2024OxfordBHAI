# Model Creation Canister

### Setup

Install mops (https://mops.one/docs/install)
Install motoko dependencies:

```bash
mops install
```

### Deploy

```bash
# Generate the bindings for the frontend
dfx generate

# local
dfx deploy model_creation_canister --argument '("bkyz2-fmaaa-aaaaa-qaaaq-cai")'

# IC mainnet
dfx deploy --ic model_creation_canister --argument '("bkyz2-fmaaa-aaaaa-qaaaq-cai")'

```

### Upload files
```bash
python3 -m scripts.upload --network local --canister model_creation_canister --model files/stories260K.bin --tokenizer files/tok512.bin --model_id Llama2_260K --wasm files/llama2.wasm --canister_id cbopz-duaaa-aaaaa-qaaka-cai --candid src/declarations/model_creation_canister/model_creation_canister.did

python3 -m scripts.upload_control_canister --network local --canister model_creation_canister --wasm files/ctrlb_canister.wasm --canister_id cbopz-duaaa-aaaaa-qaaka-cai --candid src/declarations/model_creation_canister/model_creation_canister.did
```

### Test canister creation
```bash
dfx canister call model_creation_canister testCreateCanister

## In case the entry for a model has to be deleted (use with caution): 
dfx canister call model_creation_canister reset_model_creation_artefacts '("Llama2_260K")'

## In case the control canister wasm has to be reset (use with caution):
dfx canister call model_creation_canister reset_control_canister_wasm

## Might come in handy during local testing
dfx ledger fabricate-cycles --canister model_creation_canister
```