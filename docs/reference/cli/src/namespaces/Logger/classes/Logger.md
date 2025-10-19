[envguard-monorepo](../../../../../index.md) / [cli/src](../../../index.md) / [Logger](../index.md) / Logger

# Class: Logger

Defined in: [utils/logger/logger.ts:12](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L12)

## Constructors

### Constructor

> **new Logger**(`verbose`): `Logger`

Defined in: [utils/logger/logger.ts:14](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L14)

#### Parameters

##### verbose

`boolean` = `false`

#### Returns

`Logger`

## Methods

### debug()

> **debug**(...`args`): `void`

Defined in: [utils/logger/logger.ts:94](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L94)

Logs a debug message if verbose mode is enabled.
Accepts multiple arguments like console.log

#### Parameters

##### args

...`any`[]

Any number of values to log

#### Returns

`void`

***

### error()

> **error**(...`args`): `void`

Defined in: [utils/logger/logger.ts:76](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L76)

Logs an error message.
Accepts multiple arguments like console.log

#### Parameters

##### args

...`any`[]

Any number of values to log

#### Returns

`void`

***

### info()

> **info**(...`args`): `void`

Defined in: [utils/logger/logger.ts:58](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L58)

Logs an informational message.
Accepts multiple arguments like console.log

#### Parameters

##### args

...`any`[]

Any number of values to log

#### Returns

`void`

#### Example

```ts
logger.info('User created:', user);
logger.info('Count:', 42, 'Status:', 'active');
```

***

### log()

> **log**(...`args`): `void`

Defined in: [utils/logger/logger.ts:111](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L111)

Logs a simple message with the LOG tag.
Accepts multiple arguments like console.log

#### Parameters

##### args

...`any`[]

Any number of values to log

#### Returns

`void`

***

### success()

> **success**(...`args`): `void`

Defined in: [utils/logger/logger.ts:85](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L85)

Logs a success message.
Accepts multiple arguments like console.log

#### Parameters

##### args

...`any`[]

Any number of values to log

#### Returns

`void`

***

### verbose()

> **verbose**(`tag`, ...`args`): `void`

Defined in: [utils/logger/logger.ts:36](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L36)

Logs a verbose message if verbose mode is enabled.
Accepts multiple arguments like console.log

#### Parameters

##### tag

`string`

string : The log tag to use.
> See [LogTag](../variables/LogTag.md) for the list of available options

##### args

...`any`[]

Any number of values to log (strings, objects, numbers, etc.)

#### Returns

`void`

#### Example

```ts
const logger = new Logger(true);
logger.verbose(LogTag.INFO, 'User:', user, 'Count:', 42);
logger.verbose(LogTag.DEBUG, { foo: 'bar' }, [1, 2, 3]);
```

#### Remarks

This method checks if verbose mode is enabled before logging the message.
It displays the tag followed by the arguments in dim text.

#### See

[LogTag](../variables/LogTag.md) for available log tags.

***

### warn()

> **warn**(...`args`): `void`

Defined in: [utils/logger/logger.ts:67](https://github.com/amannirala13/envguard/blob/3109fc1a57b52249408b958acacfd83ef088e5f3/packages/cli/src/utils/logger/logger.ts#L67)

Logs a warning message.
Accepts multiple arguments like console.log

#### Parameters

##### args

...`any`[]

Any number of values to log

#### Returns

`void`
