[envguard-monorepo](../../../index.md) / [cli/src](../index.md) / validateValue

# Function: validateValue()

> **validateValue**(`schma`, `value`): `boolean`

Defined in: [core/keychain.validator.ts:83](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/core/keychain.validator.ts#L83)

Validates a value using a Zod schema.

## Parameters

### schma

`ZodType`\<`any`\> = `DefaultKeyChainValueSchema`

The Zod schema to validate the value against.

### value

`string`

The value to validate.

## Returns

`boolean`

True if the value is valid, false otherwise.

## Example

```ts
const isValid = validateValue(DefaultKeyChainValueSchema, 'myValue');
console.log(isValid); // Outputs: true
```

## Remarks

This function uses the Zod library to validate the value against the schema.
If the value is valid, it returns true; otherwise, it returns false.

## See

 - DefaultKeyChainValueSchema for the default schema.
 - KeyChainKeySchema for the key schema.
 - z.ZodType for more details on the underlying implementation.
 - [validateKey](validateKey.md) for more details on the key validation.
