# DeAIssembly Backend Canister

### Setup

Install mops (https://mops.one/docs/install)
Install motoko dependencies:

```bash
mops install
```

### Deploy

```bash
# local
dfx deploy aissembly_line_canister --argument '("_______model_creation_canister_id______", "________frontend_creation_canister_id______")'

e.g.
dfx deploy aissembly_line_canister --argument '("akyz2-fmaaa-aaaaa-qaaaq-cai", "bkyz2-fmaaa-aaaaa-qaaaq-cai")'

# IC mainnet
dfx deploy --ic aissembly_line_canister #TODO: needs arguments

# Generate the bindings for the frontend
dfx generate
```