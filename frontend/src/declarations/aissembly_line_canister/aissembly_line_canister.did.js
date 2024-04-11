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
  const CanisterType = IDL.Variant({
    'Frontend' : IDL.Null,
    'Model' : IDL.Null,
  });
  const CanisterConfiguration = IDL.Record({
    'selectedModel' : IDL.Opt(AvailableModels),
    'canisterType' : CanisterType,
    'owner' : IDL.Opt(IDL.Principal),
  });
  const ModelCreationRecord = IDL.Record({
    'creationResult' : IDL.Text,
    'newCanisterId' : IDL.Text,
  });
  const ModelCreationResult = IDL.Variant({
    'Ok' : ModelCreationRecord,
    'Err' : ApiError,
  });
  const CanisterInfo = IDL.Record({
    'canisterType' : CanisterType,
    'creationTimestamp' : IDL.Nat64,
    'canisterAddress' : IDL.Text,
  });
  const UserCreationEntry = IDL.Record({
    'selectedModel' : AvailableModels,
    'frontendCanister' : IDL.Opt(CanisterInfo),
    'modelCanister' : CanisterInfo,
  });
  const UserCanistersEntryResult = IDL.Variant({
    'Ok' : UserCreationEntry,
    'Err' : ApiError,
  });
  const AissemblyLineCanister = IDL.Service({
    'amiController' : IDL.Func([], [AuthRecordResult], []),
    'createNewCanister' : IDL.Func(
        [CanisterConfiguration],
        [ModelCreationResult],
        [],
      ),
    'getUserCanistersEntry' : IDL.Func([], [UserCanistersEntryResult], []),
    'isControllerLogicOk' : IDL.Func([], [AuthRecordResult], []),
    'whoami' : IDL.Func([], [IDL.Principal], []),
  });
  return AissemblyLineCanister;
};
export const init = ({ IDL }) => { return [IDL.Text, IDL.Text]; };
