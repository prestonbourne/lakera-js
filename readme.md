# Lakera Guard Client

This is an Isomorphic Typescript client for the [Lakera Guard API](https://platform.lakera.ai/docs/api) that is capable of running on Web clients or Node.js Envionments. Note that this is a "community project" and has no official affiliation with Lakera.

## Installation

Simply use your package manager of choice

```zsh
npm install lakera-js
```

```zsh
yarn add lakera-js
```

```zsh
pnpm add lakera-js
```

## Quick Start

```ts
import { LakeraGuard } from 'lakera-js'
import OpenAI from 'openai';

const meanPrompt = "<something bad>"

// if apiKey is left blank it reads your env for `LAKERA_GUARD_API_KEY`
const lakeraClient = new LakeraGuard({
    apiKey = "<your api key here>" 
});

const res = await lakeraClient.moderate({
    input: meanPrompt
})

if(res.results[0].flagged){
    // handle malicious users
} else {
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: meanPrompt }],
        model: 'gpt-3.5-turbo',
    });
}
```
