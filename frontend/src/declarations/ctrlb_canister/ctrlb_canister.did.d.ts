import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ApiError = { 'InvalidId' : null } |
  { 'ZeroAddress' : null } |
  { 'StatusCode' : number } |
  { 'Other' : string };
export interface CanisterIDRecord { 'canister_id' : string }
export interface CtrlbCanister {
  'Inference' : ActorMethod<[Prompt], NFTOutputRecordResult>,
  'NFTAddStartPrompt' : ActorMethod<[Prompt], StatusCodeRecordResult>,
  'NFTGetStories' : ActorMethod<[NFT], NFTOutputRecordsArrayResult>,
  'NFTGetStory' : ActorMethod<[NFT], NFTOutputRecordResult>,
  'NFTSetTokenIds' : ActorMethod<[], StatusCodeRecordResult>,
  'NFTUpdate' : ActorMethod<[NFT], NFTOutputRecordResult>,
  'add_llm_canister_id' : ActorMethod<
    [CanisterIDRecord],
    StatusCodeRecordResult
  >,
  'amiController' : ActorMethod<[], StatusCodeRecordResult>,
  'amiWhitelisted' : ActorMethod<[], StatusCodeRecordResult>,
  'health' : ActorMethod<[], StatusCodeRecordResult>,
  'isWhitelistLogicOk' : ActorMethod<[], StatusCodeRecordResult>,
  'ready' : ActorMethod<[], StatusCodeRecordResult>,
  'set_llm_canister_id' : ActorMethod<
    [CanisterIDRecord],
    StatusCodeRecordResult
  >,
  'whitelistPrincipal' : ActorMethod<[Principal], StatusCodeRecordResult>,
  'whoami' : ActorMethod<[], Principal>,
}
export interface NFT { 'token_id' : string }
export interface NFTOutputRecord {
  'token_id' : string,
  'story' : string,
  'prompt' : Prompt,
}
export type NFTOutputRecordResult = { 'Ok' : NFTOutputRecord } |
  { 'Err' : ApiError };
export type NFTOutputRecordsArray = Array<NFTOutputRecord>;
export type NFTOutputRecordsArrayResult = { 'Ok' : NFTOutputRecordsArray } |
  { 'Err' : ApiError };
export interface Prompt {
  'temperature' : number,
  'topp' : number,
  'steps' : bigint,
  'rng_seed' : bigint,
  'prompt' : string,
}
export interface StatusCodeRecord { 'status_code' : number }
export type StatusCodeRecordResult = { 'Ok' : StatusCodeRecord } |
  { 'Err' : ApiError };
export interface _SERVICE extends CtrlbCanister {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
