[envguard-monorepo](../../../index.md) / [cli/src](../index.md) / IKeychainProvider

# Interface: IKeychainProvider

Defined in: [core/system-keychain.ts:63](https://github.com/amannirala13/envguard/blob/27fa3a91e5b82415a24e2e2859621b8033ae7435/packages/cli/src/core/system-keychain.ts#L63)

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

Defined in: [core/system-keychain.ts:68](https://github.com/amannirala13/envguard/blob/27fa3a91e5b82415a24e2e2859621b8033ae7435/packages/cli/src/core/system-keychain.ts#L68)

#### Returns

`Promise`\<`void`\>

---

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:67](https://github.com/amannirala13/envguard/blob/27fa3a91e5b82415a24e2e2859621b8033ae7435/packages/cli/src/core/system-keychain.ts#L67)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

---

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [core/system-keychain.ts:64](https://github.com/amannirala13/envguard/blob/27fa3a91e5b82415a24e2e2859621b8033ae7435/packages/cli/src/core/system-keychain.ts#L64)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

---

### list()

> **list**(): `Promise`\<`string`[]\>

Defined in: [core/system-keychain.ts:65](https://github.com/amannirala13/envguard/blob/27fa3a91e5b82415a24e2e2859621b8033ae7435/packages/cli/src/core/system-keychain.ts#L65)

#### Returns

`Promise`\<`string`[]\>

---

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

Defined in: [core/system-keychain.ts:66](https://github.com/amannirala13/envguard/blob/27fa3a91e5b82415a24e2e2859621b8033ae7435/packages/cli/src/core/system-keychain.ts#L66)

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`Promise`\<`void`\>
