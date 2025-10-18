[envguard-monorepo](../../../index.md) / [cli/src](../index.md) / validateKey

# Function: validateKey()

> **validateKey**(`key`): `boolean`

Defined in: [core/keychain.validator.ts:54](https://github.com/amannirala13/envguard/blob/91c6c6d5d9fbc580b45750233b2fb455656c9ae0/packages/cli/src/core/keychain.validator.ts#L54)

Validates a key using a Zod schema.

## Parameters

### key

`string`

The key to validate.

## Returns

`boolean`

True if the key is valid, false otherwise.

## Example

```ts
const isValid = validateKey('myKey');
console.log(isValid); // Outputs: true
```

## Remarks

This function uses the Zod library to validate the key against the schema.
If the key is valid, it returns true; otherwise, it returns false.

## See

 - DefaultKeyChainValueSchema for the default schema.
 - KeyChainKeySchema for the key schema.
 - z.ZodType for more details on the underlying implementation.
 - [validateValue](validateValue.md) for more details on the value validation.
