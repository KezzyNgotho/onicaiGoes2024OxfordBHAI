# Model Creation Canister

### Setup

Install mops (https://mops.one/docs/install)
Install motoko dependencies:

```bash
mops install
```

### Deploy

```bash
# local
dfx deploy model_creation_canister

# IC mainnet
dfx deploy --ic model_creation_canister

# Generate the bindings for the frontend
dfx generate
```