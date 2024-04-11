# Model Creation Canister

### Setup

Install mops (https://mops.one/docs/install)
Install motoko dependencies:

```bash
mops install
```

### Deploy

```bash
# Generate the bindings for the upload scripts and the frontend
dfx generate

# local
dfx deploy model_creation_canister --argument '("bkyz2-fmaaa-aaaaa-qaaaq-cai")'

# IC mainnet
dfx deploy --ic model_creation_canister --argument '("bkyz2-fmaaa-aaaaa-qaaaq-cai")'

```

### Upload files

Setup python environment:

```
pip install -r requirements.txt
```

Run upload script:

```bash
# --------------------------------------------------------------------------
# IMPORTANT: ic-py might throw a timeout => patch it here:
# Ubuntu:
# /home/arjaan/miniconda3/envs/<your-env>/lib/python3.10/site-packages/httpx/_config.py
# Mac:
# /Users/arjaan/miniconda3/envs/<your-env>/lib/python3.10/site-packages/httpx/_config.py
# DEFAULT_TIMEOUT_CONFIG = Timeout(timeout=5.0)
DEFAULT_TIMEOUT_CONFIG = Timeout(timeout=99999999.0)
# And perhaps here:
# Ubuntu:
# /home/arjaan/miniconda3/envs/<your-env>/lib/python3.10/site-packages/httpcore/_backends/sync.py #L28-L29
# Mac:
# /Users/arjaan/miniconda3/envs/<your-env>/lib/python3.10/site-packages/httpcore/_backends/sync.py #L28-L29
#
class SyncStream(NetworkStream):
    def __init__(self, sock: socket.socket) -> None:
        self._sock = sock

    def read(self, max_bytes: int, timeout: typing.Optional[float] = None) -> bytes:
        exc_map: ExceptionMapping = {socket.timeout: ReadTimeout, OSError: ReadError}
        with map_exceptions(exc_map):
            # PATCH AB
            timeout = 999999999
            # ENDPATCH
            self._sock.settimeout(timeout)
            return self._sock.recv(max_bytes)
# --------------------------------------------------------------------------


python -m scripts.upload --network local --canister model_creation_canister --model files/stories260K.bin --tokenizer files/tok512.bin --model_id Llama2_260K --wasm files/llama2.wasm --candid src/declarations/model_creation_canister/model_creation_canister.did

python -m scripts.upload_control_canister --network local --canister model_creation_canister --wasm files/ctrlb_canister.wasm --candid src/declarations/model_creation_canister/model_creation_canister.did
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

## Call endpoints on created control canister
## Note: use canister_id printed by testCreateCanister
dfx canister call gf4a7-g4aaa-aaaaa-qaarq-cai health
dfx canister call gf4a7-g4aaa-aaaaa-qaarq-cai amiController
dfx canister call gf4a7-g4aaa-aaaaa-qaarq-cai isWhitelistLogicOk
dfx canister call gf4a7-g4aaa-aaaaa-qaarq-cai ready
dfx canister call gf4a7-g4aaa-aaaaa-qaarq-cai amiWhitelisted
dfx canister call br5f7-7uaaa-aaaaa-qaaca-cai Inference '(record {prompt="Joe went swimming in the pool"; steps=30; temperature=0.1; topp=0.9; rng_seed=0;})'
```
