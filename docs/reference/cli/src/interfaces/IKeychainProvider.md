[envguard-monorepo](../../../index.md) / [cli/src](../index.md) / IKeychainProvider

# Interface: IKeychainProvider

Defined in: [core/system-keychain.ts:68](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L68)

IKeychainProvider defines the interface for a keychain provider.
It includes methods for getting, listing, setting, deleting, and clearing keychain entries.

 IKeychainProvider

## Example

```ts
const keychain: IKeychainProvider = new SystemKeychain('my-package-name');
await keychain.set('myKey', 'myValue');
const value = await keychain.get('myKey');
console.log(value); // Outputs: 'myValue'
await keychain.delete('myKey');
```

## Remarks

This interface provides a contract for keychain operations, allowing different implementations
to be used interchangeably. It is particularly useful for abstracting away platform-specific
keychain details and providing a consistent API for secure storage of sensitive information.

## See

 - [SystemKeychain](../classes/SystemKeychain.md) for a concrete implementation of this interface.
 - Entry from NAPI-RS Keyring for more details on the underlying implementation.
 - [set](#set) to store values in the keychain.
 - [get](#get) to retrieve values from the keychain.
 - [list](#list) to list all keys in the keychain.
 - [delete](#delete) to remove values from the keychain.
 - [clear](#clear) to clear all entries in the keychain.

## Author

amannirala13

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:73](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L73)

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:72](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L72)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [core/system-keychain.ts:69](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L69)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### list()

> **list**(): `Promise`\<`string`[]\>

Defined in: [core/system-keychain.ts:70](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L70)

#### Returns

`Promise`\<`string`[]\>

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:71](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/system-keychain.ts#L71)

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`Promise`\<`void`\>
