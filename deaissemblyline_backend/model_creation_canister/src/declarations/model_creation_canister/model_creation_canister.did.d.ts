import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ApiError = { 'InvalidId' : null } |
  { 'ZeroAddress' : null } |
  { 'Unauthorized' : null } |
  { 'StatusCode' : StatusCode } |
  { 'Other' : string };
export interface AuthRecord { 'auth' : string }
export type AuthRecordResult = { 'Ok' : AuthRecord } |
  { 'Err' : ApiError };
export type AvailableModels = { 'Llama2_260K' : null } |
  { 'Llama2_15M' : null };
export interface FileUploadRecord { 'creationResult' : string }
export type FileUploadResult = { 'Ok' : FileUploadRecord } |
  { 'Err' : ApiError };
export type InsertArtefactsResult = { 'Ok' : ModelCreationArtefacts } |
  { 'Err' : ApiError };
export interface ModelConfiguration {
  'selectedModel' : AvailableModels,
  'owner' : Principal,
}
export interface ModelCreationArtefacts {
  'canisterWasm' : Uint8Array | number[],
  'modelWeights' : Uint8Array | number[],
  'tokenizer' : Uint8Array | number[],
}
export interface ModelCreationCanister {
  'addModelCreationArtefactsEntry' : ActorMethod<
    [string, ModelCreationArtefacts],
    InsertArtefactsResult
  >,
  'amiController' : ActorMethod<[], AuthRecordResult>,
  'createCanister' : ActorMethod<[ModelConfiguration], ModelCreationResult>,
  'upload_control_wasm_bytes_chunk' : ActorMethod<
    [Uint8Array | number[]],
    FileUploadResult
  >,
  'upload_model_bytes_chunk' : ActorMethod<
    [string, Uint8Array | number[]],
    FileUploadResult
  >,
  'upload_tokenizer_bytes_chunk' : ActorMethod<
    [string, Uint8Array | number[]],
    FileUploadResult
  >,
  'upload_wasm_bytes_chunk' : ActorMethod<
    [string, Uint8Array | number[]],
    FileUploadResult
  >,
  'whoami' : ActorMethod<[], Principal>,
}
export interface ModelCreationRecord {
  'creationResult' : string,
  'newCanisterId' : string,
}
export type ModelCreationResult = { 'Ok' : ModelCreationRecord } |
  { 'Err' : ApiError };
export type StatusCode = number;
export interface _SERVICE extends ModelCreationCanister {}
