[envguard-monorepo](../../../index.md) / [cli/src](../index.md) / verbose

# Function: verbose()

> **verbose**(`v`, `tag`, ...`args`): `void`

Defined in: [utils/logger/logger.utils.ts:15](https://github.com/amannirala13/envguard/blob/87b168e9d43b40a7a2649202a947bdb992c12274/packages/cli/src/utils/logger/logger.utils.ts#L15)

Logs a verbose message if verbose mode is enabled.
Accepts multiple arguments like console.log

## Parameters

### v

`boolean`

Verbose flag

### tag

`string`

Log tag to use

### args

...`any`[]

Any number of messages/objects to log

## Returns

`void`

## Example

```ts
verbose(true, LogTag.INFO, 'User:', user, 'Count:', 42);
verbose(false, LogTag.DEBUG, 'This will not show');
```
