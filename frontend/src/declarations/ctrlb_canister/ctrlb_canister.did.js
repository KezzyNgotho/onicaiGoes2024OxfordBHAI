export const idlFactory = ({ IDL }) => {
  const Prompt = IDL.Record({
    'temperature' : IDL.Float64,
    'topp' : IDL.Float64,
    'steps' : IDL.Nat64,
    'rng_seed' : IDL.Nat64,
    'prompt' : IDL.Text,
  });
  const NFTOutputRecord = IDL.Record({
    'token_id' : IDL.Text,
    'story' : IDL.Text,
    'prompt' : Prompt,
  });
  const ApiError = IDL.Variant({
    'InvalidId' : IDL.Null,
    'ZeroAddress' : IDL.Null,
    'StatusCode' : IDL.Nat16,
    'Other' : IDL.Text,
  });
  const NFTOutputRecordResult = IDL.Variant({
    'Ok' : NFTOutputRecord,
    'Err' : ApiError,
  });
  const StatusCodeRecord = IDL.Record({ 'status_code' : IDL.Nat16 });
  const StatusCodeRecordResult = IDL.Variant({
    'Ok' : StatusCodeRecord,
    'Err' : ApiError,
  });
  const NFT = IDL.Record({ 'token_id' : IDL.Text });
  const NFTOutputRecordsArray = IDL.Vec(NFTOutputRecord);
  const NFTOutputRecordsArrayResult = IDL.Variant({
    'Ok' : NFTOutputRecordsArray,
    'Err' : ApiError,
  });
  const CanisterIDRecord = IDL.Record({ 'canister_id' : IDL.Text });
  const CtrlbCanister = IDL.Service({
    'Inference' : IDL.Func([Prompt], [NFTOutputRecordResult], []),
    'NFTAddStartPrompt' : IDL.Func([Prompt], [StatusCodeRecordResult], []),
    'NFTGetStories' : IDL.Func([NFT], [NFTOutputRecordsArrayResult], []),
    'NFTGetStory' : IDL.Func([NFT], [NFTOutputRecordResult], []),
    'NFTSetTokenIds' : IDL.Func([], [StatusCodeRecordResult], []),
    'NFTUpdate' : IDL.Func([NFT], [NFTOutputRecordResult], []),
    'add_llm_canister_id' : IDL.Func(
        [CanisterIDRecord],
        [StatusCodeRecordResult],
        [],
      ),
    'amiController' : IDL.Func([], [StatusCodeRecordResult], []),
    'amiWhitelisted' : IDL.Func([], [StatusCodeRecordResult], []),
    'health' : IDL.Func([], [StatusCodeRecordResult], []),
    'isWhitelistLogicOk' : IDL.Func([], [StatusCodeRecordResult], []),
    'ready' : IDL.Func([], [StatusCodeRecordResult], []),
    'set_llm_canister_id' : IDL.Func(
        [CanisterIDRecord],
        [StatusCodeRecordResult],
        [],
      ),
    'whitelistPrincipal' : IDL.Func(
        [IDL.Principal],
        [StatusCodeRecordResult],
        [],
      ),
    'whoami' : IDL.Func([], [IDL.Principal], []),
  });
  return CtrlbCanister;
};
export const init = ({ IDL }) => { return []; };
