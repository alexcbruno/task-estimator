# Task Estimator

A minimal tool for quickly assigning Fibonacci point values to development tasks. Enter tasks one at a time, check off applicable complexity criteria, and get a final list of story point estimates.

## Usage

### Estimating tasks

1. Type a task name into the input field
2. Check any criteria that apply to the task — each criterion has a hidden point value
3. Click **Next task** to save and start a new task, or **Finish** when you're done

### Results

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

## Customizing criteria

Open [`src/data/criteria.ts`](src/data/criteria.ts) to add, remove, or reweight the checklist items. Each criterion has a `label` shown to the user and a `points` value that stays hidden during estimation.

```ts
export const CRITERIA: Criterion[] = [
  { id: 'new-endpoint', label: 'Requires a new API endpoint', points: 2 },
  { id: 'db-change',    label: 'Requires database schema changes', points: 3 },
  // ...
]
```

Point values don't need to follow any particular scale — the app always rounds the final total up to the nearest Fibonacci number.

## Installation

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/alexcbruno/task-estimator.git
cd task-estimator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

Output is written to `dist/`.

## Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) (Checkbox, Dialog primitives)
