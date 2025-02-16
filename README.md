# Open Source Clone ChatGpt UI with Ollama

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).
Made by Chatgpt, Github copilot and Deepseek prompts

## Getting Started

### 1. Install Dependencies

Make sure you have Node.js installed, then install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Install Ollama

Ollama is required to run the LLM model. Download and install it from:

[https://ollama.com](https://ollama.com)

Follow the installation instructions based on your operating system.

### 3. Download an Ollama Model

After installing Ollama, download your preferred LLM model. For example, to download `llama2`, run:

```bash
ollama pull llama2
ollama pull ollama run deepseek-r1:7b
```

Replace `llama2` with the model of your choice.

### 4. Configure Environment Variables

Create a `.env.local or .env` file in the root of your project if it doesn’t exist, and add the following line:

```ini
LLM_MODEL=llama2
```

Ensure that the model name matches the one you downloaded with Ollama.

### 5. Run the Development Server

Start the development server with:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
