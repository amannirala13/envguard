[envguard-monorepo](../../../index.md) / [cli/src](../index.md) / SystemKeychain

# Class: SystemKeychain

Defined in: [core/system-keychain.ts:119](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L119)

SystemKeychain provides a secure way to store and retrieve sensitive information
such as tokens and passwords using the system's native keychain services.
It leverages the NAPI-RS Keyring library to interact with the underlying keychain.

## Implements

SystemKeychain

## Class Desc

SystemKeychain provides methods to set, get, delete, list, and clear keychain entries.
It uses the package name as the service identifier to namespace the entries.
This ensures that entries from different applications do not conflict with each other.

## Param

The package name used as the service identifier in the keychain.

## Throws

Propagates errors from the underlying keychain operations so callers can handle failures.

## Example

```ts
const keychain = new SystemKeychain('my-package-name');
await keychain.set('myKey', 'myValue');
const value = await keychain.get('myKey');
console.log(value); // Outputs: 'myValue'
await keychain.delete('myKey');
```

## Remarks

The SystemKeychain class is designed to provide a simple and consistent interface for keychain operations
across different platforms. It abstracts away the complexities of dealing with platform-specific
keychain APIs, allowing developers to focus on their application logic.

Note that some operations, such as listing all keys or clearing the keychain, are not supported
by the underlying NAPI-RS Keyring library and are implemented as no-ops or return empty results.

## See

 - [IKeychainProvider](../interfaces/IKeychainProvider.md) for the interface definition.
 - Entry from NAPI-RS Keyring for more details on the underlying implementation.
 - [set](#set) to store values in the keychain.
 - [get](#get) to retrieve values from the keychain.
 - [list](#list) to list all keys in the keychain (not supported).
 - [delete](#delete) to remove values from the keychain.
 - [clear](#clear) to clear all entries in the keychain (not supported).

## Author

amannirala13

## Implements

- [`IKeychainProvider`](../interfaces/IKeychainProvider.md)

## Constructors

### Constructor

> **new SystemKeychain**(`packageName`, `projectRoot`): `SystemKeychain`

Defined in: [core/system-keychain.ts:143](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L143)

Creates an instance of SystemKeychain.

#### Parameters

##### packageName

`string`

The package name used as the service identifier in the keychain.

##### projectRoot

`string` = `...`

Project root directory (defaults to process.cwd())

#### Returns

`SystemKeychain`

#### Example

```ts
const keychain = new SystemKeychain('my-package-name', '/path/to/project');
```

#### Remarks

The package name is used to namespace the keychain entries, ensuring that they do not conflict
with entries from other applications. The project root is used to locate the project-local
manifest file at .envguard/manifest.json.

#### See

 - [set](#set) to store values in the keychain.
 - [get](#get) to retrieve values from the keychain.
 - [list](#list) to list all keys in the keychain (now supported via manifest).
 - [delete](#delete) to remove values from the keychain.

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:221](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L221)

Clears all entries from the keychain.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation is complete.

#### Warning

NAPI-RS Keyring does not support clearing all entries. This method is a noop.

#### Throws

Will not throw; this is a noop.

#### Example

```ts
await keychain.clear();
```

#### Remarks

This method is included to fulfill the IKeychainProvider interface but does not provide actual
functionality due to limitations in the underlying library.

#### See

 - [set](#set) to store values in the keychain.
 - [get](#get) to retrieve values from the keychain.
 - [list](#list) to list all keys in the keychain (not supported).
 - [delete](#delete) to remove values from the keychain.

#### Implementation of

[`IKeychainProvider`](../interfaces/IKeychainProvider.md).[`clear`](../interfaces/IKeychainProvider.md#clear)

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:249](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L249)

Deletes a value from the keychain.

#### Parameters

##### key

`string`

The key to delete.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the value is deleted.

#### Throws

- Error Will throw an error if the key is not valid.
- Error Rethrows any error encountered while deleting the underlying keychain entry.

#### Example

```ts
await keychain.delete('myKey');
```

#### Remarks

This method uses the NAPI-RS Keyring library to delete the value securely from the system keychain.
If an error occurs during the operation, it is logged and the error is rethrown so callers can decide how to handle it.
Use this method to remove sensitive information such as tokens or passwords.

#### See

 - [set](#set) to store values in the keychain.
 - [get](#get) to retrieve values from the keychain.
 - [list](#list) to list all keys in the keychain (not supported).
 - [clear](#clear) to clear all entries in the keychain (not supported).

#### Implementation of

[`IKeychainProvider`](../interfaces/IKeychainProvider.md).[`delete`](../interfaces/IKeychainProvider.md#delete)

***

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [core/system-keychain.ts:181](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L181)

Gets a value from the keychain.

#### Parameters

##### key

`string`

The key to retrieve.

#### Returns

`Promise`\<`string` \| `null`\>

A promise that resolves to the value associated with the key, or null if not found.

#### Throws

- Error Will throw an error if the key is not valid.
- Will **not** throw an error if the key is not found. Instead, it will return null.

#### Example

```ts
const value = await keychain.get('myKey');
console.log(value);
```

#### Remarks

This method uses the NAPI-RS Keyring library to retrieve the value securely from the system keychain.
If an error occurs during the operation, it is logged and the error is rethrown so callers can decide how to handle it.
Use this method to retrieve sensitive information such as tokens or passwords.

#### See

 - [set](#set) to store values in the keychain.
 - [delete](#delete) to remove values from the keychain.
 - [list](#list) to list all keys in the keychain (not supported).
 - [clear](#clear) to clear all entries in the keychain (not supported).

#### Implementation of

[`IKeychainProvider`](../interfaces/IKeychainProvider.md).[`get`](../interfaces/IKeychainProvider.md#get)

***

### getProjectRoot()

> **getProjectRoot**(): `string`

Defined in: [core/system-keychain.ts:356](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L356)

Get project root directory

#### Returns

`string`

Project root path

***

### list()

> **list**(): `Promise`\<`string`[]\>

Defined in: [core/system-keychain.ts:347](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L347)

Lists all keys stored in the keychain for this package.

#### Returns

`Promise`\<`string`[]\>

Array of key names stored for this package.

#### Throws

Will not throw under normal circumstances.

#### Example

```ts
const keys = await keychain.list();
console.log(keys); // ['API_KEY', 'DATABASE_URL']
```

#### Remarks

This method reads from the manifest file since NAPI-RS Keyring does not support listing entries directly.
The manifest tracks which keys have been set for each package.

#### See

 - [get](#get) to retrieve values from the keychain.
 - [set](#set) to store values in the keychain.
 - [delete](#delete) to remove values from the keychain.
 - [clear](#clear) to clear all entries in the keychain (not supported).

#### Implementation of

[`IKeychainProvider`](../interfaces/IKeychainProvider.md).[`list`](../interfaces/IKeychainProvider.md#list)

***

### set()

> **set**(`key`, `value`, `required`): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:297](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L297)

Sets a value in the keychain.

#### Parameters

##### key

`string`

The key to set.

##### value

`string`

The value to set.

##### required

`boolean` = `true`

Whether the key is required (default: true)

#### Returns

`Promise`\<`void`\>

A promise that resolves when the value is set.

#### Throws

- Error Will throw an error if the key is not valid.
- Error Will throw an error if the value is not valid.
- Error Rethrows any error encountered while storing the value in the underlying keychain entry.

#### Example

```ts
await keychain.set('myKey', 'myValue');
await keychain.set('optionalKey', 'value', false); // Mark as optional
```

#### Remarks

This method uses the NAPI-RS Keyring library to store the value securely in the system keychain.
If an error occurs during the operation, it is logged and the error is rethrown so callers can decide how to handle it.
Use this method to store sensitive information such as tokens or passwords.

#### See

 - [get](#get) to retrieve values from the keychain.
 - [delete](#delete) to remove values from the keychain.
 - [list](#list) to list all keys in the keychain (not supported).
 - [clear](#clear) to clear all entries in the keychain (not supported).

#### Implementation of

[`IKeychainProvider`](../interfaces/IKeychainProvider.md).[`set`](../interfaces/IKeychainProvider.md#set)
