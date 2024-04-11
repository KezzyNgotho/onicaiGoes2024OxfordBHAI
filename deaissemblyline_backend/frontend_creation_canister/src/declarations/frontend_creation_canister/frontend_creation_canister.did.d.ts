import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ApiError = { 'InvalidId' : null } |
  { 'ZeroAddress' : null } |
  { 'Unauthorized' : null } |
  { 'Other' : string };
export interface AuthRecord { 'auth' : string }
export type AuthRecordResult = { 'Ok' : AuthRecord } |
  { 'Err' : ApiError };
export type AvailableModels = { 'Llama2_260K' : null } |
  { 'Llama2_15M' : null };
export interface CreationCanister {
  'amiController' : ActorMethod<[], AuthRecordResult>,
  'createCanister' : ActorMethod<
    [FrontendConfiguration],
    FrontendCreationResult
  >,
  'setMasterCanisterId' : ActorMethod<[string], AuthRecordResult>,
  'whoami' : ActorMethod<[], Principal>,
}
export interface FrontendConfiguration {
  'selectedModel' : AvailableModels,
  'owner' : Principal,
  'associatedModelCanisterId' : string,
}
export interface FrontendCreationRecord {
  'creationResult' : string,
  'newCanisterId' : string,
}
export type FrontendCreationResult = { 'Ok' : FrontendCreationRecord } |
  { 'Err' : ApiError };
export interface _SERVICE extends CreationCanister {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
