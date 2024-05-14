# Omnivore

![Omnivore app](public/Hero.png)

## About

Omnivore is an ongoing attempt to build an Omni meal planning app - whatever that may be!

At present the app uses the latest OpenAI `GPT-4o` model, plus shows basic implementations of

- Assistant api
- File search (with Vector storage)
- Function calling
- Vision
- Image generation
- Chat completion,
- Text to speech
- Speech to text

I plan to upgrade the app with examples of how to use GPT-4o's new audio and video capabilities - when I get access.

It’s a toy app, meant to be run locally off your home computer/network and not deployed remotely. Omnivore uses Airtable as backend to help you get started easily, and I've found it's easy to tweak as you go. You can also access your shopping list, meal and recipes via the Airtable mobile app.

I hope you have a fun few weekends with it, learning about the APIs and getting inspired about designing your own amazing Omni apps. And hopefully get some cooking done too.

## Getting started

### 1. Clone the repo

```shell
git clone https://github.com/joshuacrowley/omnivore.git
cd omnivore
```

### 2. Copy the .env.example file, and save it as .env.local.

### 3. Create your [OpenAI API key](https://platform.openai.com/api-keys)

Set it as REACT_APP_OPENAI_API_KEY in .env.local.

### 4. Set a [monthly budget](https://platform.openai.com/settings/organization/limits)

Good idea while we're still experimenting.

### 5. Copy this [Airtable Base](https://airtable.com/appdqcBRR3roXoUQd/shrWBkBRSTnR6xfZs)

![Airtable base](airtable-base.png).

### 5. Create an Airtable [personal access token](https://airtable.com/create/tokens)

Needs access to your copied base and `data.records:read` and `data.records:write`. Set it as REACT_APP_AIRTABLE_API_KEY in .env.local.

### 5. Copy the Airtable Base ID

You can pluck it from the url when viewing your base https://airtable.com/app.../. Set it as REACT_APP_AIRTABLE_BASE in .env.local.

### 6. Install dependencies

```shell
npm install
```

### 7. Run

```shell
npm run dev
```

### 8. Navigate to [http://localhost:3000](http://localhost:3000).

### 7. Once you've added some recipes, you can create files to upload to your assistant.

```shell
npm run makeFiles
```

## Contributions

Small or big are welcome :)

## Feedback

You can reach me here -> [https://twitter.com/ojschwa](https://twitter.com/ojschwa) - love to hear any experiences, big or small.

## Resources

- A Next.js [Openai assistants quickstart](https://github.com/openai/openai-assistants-quickstart)
