# DeAIssembly Backend Canister

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
dfx deploy aissembly_line_canister --argument '("_______model_creation_canister_id______", "________frontend_creation_canister_id______")'

e.g.
dfx deploy aissembly_line_canister --argument '("bkyz2-fmaaa-aaaaa-qaaaq-cai", "be2us-64aaa-aaaaa-qaabq-cai")'

# IC mainnet
dfx deploy --ic aissembly_line_canister '("_______model_creation_canister_id______", "________frontend_creation_canister_id______")'

e.g.
dfx deploy --ic aissembly_line_canister --argument '("4o25u-bqaaa-aaaai-acrha-cai", "4j33a-miaaa-aaaai-acrhq-cai")'

```