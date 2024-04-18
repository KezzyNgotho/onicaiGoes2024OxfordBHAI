export const idlFactory = ({ IDL }) => {
  const AuthRecord = IDL.Record({ 'auth' : IDL.Text });
  const ApiError = IDL.Variant({
    'InvalidId' : IDL.Null,
    'ZeroAddress' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'Other' : IDL.Text,
  });
  const AuthRecordResult = IDL.Variant({ 'Ok' : AuthRecord, 'Err' : ApiError });
  const AvailableModels = IDL.Variant({
    'Llama2_260K' : IDL.Null,
    'Llama2_15M' : IDL.Null,
  });
  const FrontendConfiguration = IDL.Record({
    'selectedModel' : AvailableModels,
    'owner' : IDL.Principal,
    'associatedModelCanisterId' : IDL.Text,
  });
  const FrontendCreationRecord = IDL.Record({
    'creationResult' : IDL.Text,
    'newCanisterId' : IDL.Text,
  });
  const FrontendCreationResult = IDL.Variant({
    'Ok' : FrontendCreationRecord,
    'Err' : ApiError,
  });
  const CreationCanister = IDL.Service({
    'amiController' : IDL.Func([], [AuthRecordResult], []),
    'createCanister' : IDL.Func(
        [FrontendConfiguration],
        [FrontendCreationResult],
        [],
      ),
    'setMasterCanisterId' : IDL.Func([IDL.Text], [AuthRecordResult], []),
    'whoami' : IDL.Func([], [IDL.Principal], []),
  });
  return CreationCanister;
};
export const init = ({ IDL }) => { return []; };
