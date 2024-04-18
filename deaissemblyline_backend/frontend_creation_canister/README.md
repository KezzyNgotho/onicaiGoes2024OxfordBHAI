# Frontend Creation Canister

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
dfx deploy frontend_creation_canister

# IC mainnet
dfx deploy --ic frontend_creation_canister

# Set DeAIssembly Backend as master canister (you have to deploy that canister first and then return with its id)
dfx canister call frontend_creation_canister setMasterCanisterId '("bw4dl-smaaa-aaaaa-qaacq-cai")'

dfx canister call --ic frontend_creation_canister setMasterCanisterId '("6ugvi-7aaaa-aaaai-acria-cai")'
```