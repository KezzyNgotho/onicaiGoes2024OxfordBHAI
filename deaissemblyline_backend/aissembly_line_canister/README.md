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
dfx deploy aissembly_line_canister

# IC mainnet
dfx deploy --ic aissembly_line_canister

# Generate the bindings for the frontend
dfx generate
```