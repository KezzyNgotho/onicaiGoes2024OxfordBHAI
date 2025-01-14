export const idlFactory = ({ IDL }) => {
  const ModelCreationArtefacts = IDL.Record({
    'canisterWasm' : IDL.Vec(IDL.Nat8),
    'modelWeights' : IDL.Vec(IDL.Nat8),
    'tokenizer' : IDL.Vec(IDL.Nat8),
  });
  const StatusCode = IDL.Nat16;
  const ApiError = IDL.Variant({
    'InvalidId' : IDL.Null,
    'ZeroAddress' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'StatusCode' : StatusCode,
    'Other' : IDL.Text,
  });
  const InsertArtefactsResult = IDL.Variant({
    'Ok' : ModelCreationArtefacts,
    'Err' : ApiError,
  });
  const AuthRecord = IDL.Record({ 'auth' : IDL.Text });
  const AuthRecordResult = IDL.Variant({ 'Ok' : AuthRecord, 'Err' : ApiError });
  const AvailableModels = IDL.Variant({
    'Llama2_260K' : IDL.Null,
    'Llama2_15M' : IDL.Null,
  });
  const ModelConfiguration = IDL.Record({
    'selectedModel' : AvailableModels,
    'owner' : IDL.Principal,
  });
  const ModelCreationRecord = IDL.Record({
    'newLlmCanisterId' : IDL.Text,
    'newCtlrbCanisterId' : IDL.Text,
    'creationResult' : IDL.Text,
  });
  const ModelCreationResult = IDL.Variant({
    'Ok' : ModelCreationRecord,
    'Err' : ApiError,
  });
  const FileUploadRecord = IDL.Record({ 'creationResult' : IDL.Text });
  const FileUploadResult = IDL.Variant({
    'Ok' : FileUploadRecord,
    'Err' : ApiError,
  });
  const ModelCreationCanister = IDL.Service({
    'addModelCreationArtefactsEntry' : IDL.Func(
        [IDL.Text, ModelCreationArtefacts],
        [InsertArtefactsResult],
        [],
      ),
    'amiController' : IDL.Func([], [AuthRecordResult], []),
    'createCanister' : IDL.Func(
        [ModelConfiguration],
        [ModelCreationResult],
        [],
      ),
    'get_model_creation_artefacts' : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, ModelCreationArtefacts)))],
        ['query'],
      ),
    'get_models_with_creation_artefacts' : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(IDL.Text))],
        ['query'],
      ),
    'reset_control_canister_wasm' : IDL.Func([], [FileUploadResult], []),
    'reset_model_creation_artefacts' : IDL.Func(
        [IDL.Text],
        [FileUploadResult],
        [],
      ),
    'setMasterCanisterId' : IDL.Func([IDL.Text], [AuthRecordResult], []),
    'testCreateCanister' : IDL.Func([], [ModelCreationResult], []),
    'testCreateCanister15M' : IDL.Func([], [ModelCreationResult], []),
    'upload_control_wasm_bytes_chunk' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [FileUploadResult],
        [],
      ),
    'upload_model_bytes_chunk' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8)],
        [FileUploadResult],
        [],
      ),
    'upload_tokenizer_bytes_chunk' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8)],
        [FileUploadResult],
        [],
      ),
    'upload_wasm_bytes_chunk' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8)],
        [FileUploadResult],
        [],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], []),
  });
  return ModelCreationCanister;
};
export const init = ({ IDL }) => { return []; };
