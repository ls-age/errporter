# errporter

> Let users report errors to GitHub
>
> **This project is currently under development**

## Installation

As usual, run `npm install errporter`.

## Usage

**Command line interface**

```
errporter ls-age/errporter --title "Something did not work"
```

**Inside a node module**

```javascript
import { reportError } from 'errporter';

async function doSomething() {
  ...
}

doSomething().catch(async error => {
  // Your error handling, e.g.:
  // process.exitCode = 1;
  // console.error(error);

  await reportError(error);
});
```
