# Task Estimator

A small suite of minimal internal tools, built with a shared stack and visual style. Each tool is its own Vite entry point in this repo — there's no shared nav yet, so open each one at its own path.

- **Task Estimator** (`/`) — assign Fibonacci point values to development tasks.
- **Illustration Prompt Builder** (`/prompts/`) — build an on-brand isometric illustration prompt step by step from FuelCloud's illustration style system.

## Task Estimator

A minimal tool for quickly assigning Fibonacci point values to development tasks. Enter tasks one at a time, check off applicable complexity criteria, and get a final list of story point estimates.

### Usage

1. Type a task name into the input field
2. Check any criteria that apply to the task — each criterion has a hidden point value
3. Click **Next task** to save and start a new task, or **Finish** when you're done

#### Results

After clicking Finish, you'll see each task with:
- Its raw score (sum of checked criteria)
- Its **Fibonacci-rounded score** — if the raw score doesn't land on the Fibonacci scale (1, 2, 3, 5, 8, 13, 21), it's bumped up to the next value

You can click any task to expand it and adjust its criteria. Changes update the score immediately.

Click **Copy list** to copy all task names and their Fibonacci scores to your clipboard:

```
Add OAuth login flow: 8
Migrate user table: 13
```

Click **Start over** to clear everything and begin a new session.

### Customizing criteria

Open [`src/data/criteria.ts`](src/data/criteria.ts) to add, remove, or reweight the checklist items. Each criterion has a `label` shown to the user and a `points` value that stays hidden during estimation.

```ts
export const CRITERIA: Criterion[] = [
  { id: 'new-endpoint', label: 'Requires a new API endpoint', points: 2 },
  { id: 'db-change',    label: 'Requires database schema changes', points: 3 },
  // ...
]
```

Point values don't need to follow any particular scale — the app always rounds the final total up to the nearest Fibonacci number.

## Illustration Prompt Builder

A step-by-step wizard for assembling a paste-ready image-generation prompt from FuelCloud's illustration style system, without having to write or remember the style rules by hand. Isometric is the only supported style — works with Midjourney, DALL·E, Firefly, Stable Diffusion, or a human illustrator brief; the output is plain prose, no platform-specific flags.

### Usage

1. Describe the subject/action in one sentence
2. Optionally add one or more characters by picking hair and skin tone, then a pose and prop — wardrobe is left for the model to infer from the subject and the style block's "professional/industrial workwear" rule, not hand-picked
3. Pick any key objects/icons in the scene, and optionally mark one as the oversized "hero" object
4. Pick an accent color, if any
5. Review the assembled prompt and click **Copy prompt**

The output combines the fixed Style Block with a Content Brief filled in from your choices, plus an optional exclusions (negative prompt) block for tools that support one. Backgrounds aren't part of the brief — they're simple enough to add or change separately after generation.

### Customizing the style system

Open [`src/prompts/data/styleSystem.ts`](src/prompts/data/styleSystem.ts) to edit the style block text, exclusions, or any of the pickable option lists (skin tones, hair colors, accent colors, key objects). The prompt-assembly logic itself lives in [`src/prompts/lib/prompt.ts`](src/prompts/lib/prompt.ts).

## Installation

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/alexcbruno/task-estimator.git
cd task-estimator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the Task Estimator, or [http://localhost:5173/prompts/](http://localhost:5173/prompts/) for the Illustration Prompt Builder.

### Build for production

```bash
npm run build
```

Both tools are built as separate entry points; output is written to `dist/` (`dist/index.html` and `dist/prompts/index.html`).

## Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) (Checkbox, Dialog primitives)
