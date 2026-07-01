import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Copy, RotateCcw, X } from "lucide-react";
import { CRITERIA, type Criterion } from "./data/criteria";
import {
  getPoints,
  roundUpToFibonacci,
  cn,
  type Intensity,
  type Selections,
} from "./lib/utils";
import { Checkbox } from "./components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./components/ui/dialog";
import "./index.css";

interface Task {
  name: string;
  selections: Selections;
}

type View = "entry" | "results";

const INTENSITY_LEVELS: { value: Intensity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "med", label: "Med" },
  { value: "high", label: "High" },
];

// Round to at most 2 decimals and drop trailing zeros for display.
function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

function CriterionRow({
  criterion,
  intensity,
  onToggle,
  onSetIntensity,
}: {
  criterion: Criterion;
  intensity: Intensity | undefined;
  onToggle: () => void;
  onSetIntensity: (level: Intensity) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 min-h-[28px]">
      <label className="flex items-start gap-3 group flex-1 min-w-0 cursor-pointer">
        <Checkbox
          checked={!!intensity}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <span className="text-sm group-hover:underline underline-offset-2">
          {criterion.label}
        </span>
      </label>

      {/* Always reserve space for the intensity group so the label wraps consistently. */}
      <div
        className={cn(
          "shrink-0 flex border border-black",
          !intensity && "invisible pointer-events-none",
        )}
      >
        {INTENSITY_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onSetIntensity(level.value)}
            className={cn(
              "px-2 py-0.5 text-xs uppercase tracking-wide border-l border-black first:border-l-0",
              intensity === level.value
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100",
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("entry");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [selections, setSelections] = useState<Selections>({});
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showFinishWarning, setShowFinishWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const taskListRef = useRef<HTMLDivElement>(null);

  // Dismiss the added-tasks popover when clicking anywhere outside it.
  useEffect(() => {
    if (!showTaskList) return;
    function onPointerDown(e: MouseEvent) {
      if (!taskListRef.current?.contains(e.target as Node)) {
        setShowTaskList(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showTaskList]);

  const trimmedName = taskName.trim();
  const hasSelections = Object.keys(selections).length > 0;
  const canSubmit = trimmedName.length > 0;
  // A task is complete once it has a name and at least one criterion.
  const isEntryComplete = trimmedName.length > 0 && hasSelections;
  const isEntryInProgress = trimmedName.length > 0 || hasSelections;
  // Finish is allowed whenever there's something to show: an added task or a
  // complete current one.
  const canFinish = tasks.length > 0 || isEntryComplete;

  function saveAndNext() {
    setTasks((prev) => [...prev, { name: trimmedName, selections }]);
    setTaskName("");
    setSelections({});
  }

  function finishWithCurrent() {
    setTasks((prev) => [...prev, { name: trimmedName, selections }]);
    setView("results");
  }

  function finishSkippingCurrent() {
    setShowFinishWarning(false);
    setView("results");
  }

  function handleFinish() {
    if (isEntryComplete) {
      finishWithCurrent();
    } else if (isEntryInProgress) {
      // Something's been entered but it's incomplete — confirm before dropping it.
      setShowFinishWarning(true);
    } else {
      // Nothing in progress; finish with the already-added tasks.
      setView("results");
    }
  }

  function requestDeleteTask(index: number) {
    setTaskToDelete(index);
  }

  function confirmDeleteTask() {
    if (taskToDelete === null) return;
    const next = tasks.filter((_, i) => i !== taskToDelete);
    setTasks(next);
    setExpandedTask(null);
    setTaskToDelete(null);
    if (view === "results" && next.length === 0) setView("entry");
  }

  // Toggle a criterion in the in-progress entry. Defaults to "high" when checked.
  function toggleCriterion(id: string) {
    setSelections((prev) => {
      if (prev[id]) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: "low" };
    });
  }

  function setIntensity(id: string, level: Intensity) {
    setSelections((prev) => ({ ...prev, [id]: level }));
  }

  function toggleTaskCriterion(taskIndex: number, id: string) {
    setTasks((prev) =>
      prev.map((task, i) => {
        if (i !== taskIndex) return task;
        if (task.selections[id]) {
          const { [id]: _removed, ...rest } = task.selections;
          return { ...task, selections: rest };
        }
        return { ...task, selections: { ...task.selections, [id]: "high" } };
      }),
    );
  }

  function setTaskIntensity(taskIndex: number, id: string, level: Intensity) {
    setTasks((prev) =>
      prev.map((task, i) =>
        i === taskIndex
          ? { ...task, selections: { ...task.selections, [id]: level } }
          : task,
      ),
    );
  }

  function handleCopy() {
    const lines = tasks.map((task) => {
      const fib = roundUpToFibonacci(getPoints(task.selections));
      return `${task.name}: ${fib}`;
    });
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleStartOver() {
    setTasks([]);
    setTaskName("");
    setSelections({});
    setExpandedTask(null);
    setShowConfirmReset(false);
    setShowTaskList(false);
    setTaskToDelete(null);
    setShowFinishWarning(false);
    setView("entry");
  }

  const deletingTask = taskToDelete !== null ? tasks[taskToDelete] : null;
  const deleteDialog = (
    <Dialog
      open={taskToDelete !== null}
      onOpenChange={(open) => {
        if (!open) setTaskToDelete(null);
      }}
    >
      <DialogContent>
        <DialogTitle>Delete task?</DialogTitle>
        <DialogDescription>
          {deletingTask ? `“${deletingTask.name}”` : "This task"} will be
          removed. This cannot be undone.
        </DialogDescription>
        <div className="flex gap-3 justify-end">
          <DialogClose asChild>
            <button className="border border-black px-4 py-2 text-sm hover:bg-gray-100">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={confirmDeleteTask}
            className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Results view ──────────────────────────────────────────────────────────────
  if (view === "results") {
    const totalFib = tasks.reduce(
      (sum, t) => sum + roundUpToFibonacci(getPoints(t.selections)),
      0,
    );

    return (
      <div className="min-h-screen bg-white text-black font-mono">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Estimation Results
            </h1>
          </div>

          <div className="text-xs uppercase tracking-widest mb-1">Total</div>
          <div className="text-4xl font-bold mb-8">{totalFib} pts</div>

          <div className="border-t-2 border-black">
            {tasks.map((task, i) => {
              const rawPts = getPoints(task.selections);
              const fibPts = roundUpToFibonacci(rawPts);
              const isExpanded = expandedTask === i;

              return (
                <div key={i} className="border-b border-black">
                  <div className="flex items-center">
                    <button
                      onClick={() => requestDeleteTask(i)}
                      aria-label={`Remove ${task.name}`}
                      className="shrink-0 p-3 text-gray-400 hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      className="flex-1 min-w-0 text-left py-3 flex items-center justify-between hover:bg-gray-50"
                      onClick={() => setExpandedTask(isExpanded ? null : i)}
                    >
                      <span className="font-medium truncate pr-4">
                        {task.name}
                      </span>
                      <span className="shrink-0 flex items-center gap-3 text-sm pe-3">
                        <span className="text-gray-400">{fmt(rawPts)} pts</span>
                        <span className="font-bold">{fibPts} pts</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pb-4 pt-2 px-4 space-y-1 border-t border-dashed border-black bg-gray-50">
                      {CRITERIA.map((criterion) => (
                        <CriterionRow
                          key={criterion.id}
                          criterion={criterion}
                          intensity={task.selections[criterion.id]}
                          onToggle={() => toggleTaskCriterion(i, criterion.id)}
                          onSetIntensity={(level) =>
                            setTaskIntensity(i, criterion.id, level)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-2 border border-black px-4 py-2 text-sm hover:bg-black hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy list"}
            </button>
          </div>
        </div>

        <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
          <DialogContent>
            <DialogTitle>Start over?</DialogTitle>
            <DialogDescription>
              All {tasks.length} task{tasks.length !== 1 ? "s" : ""} will be
              deleted. This cannot be undone.
            </DialogDescription>
            <div className="flex gap-3 justify-end">
              <DialogClose asChild>
                <button className="border border-black px-4 py-2 text-sm hover:bg-gray-100">
                  Cancel
                </button>
              </DialogClose>
              <button
                onClick={handleStartOver}
                className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
              >
                Reset
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {deleteDialog}
      </div>
    );
  }

  // ── Entry view ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex row justify-between border-b-2 border-black pb-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Task Estimator</h1>
          {tasks.length > 0 && (
            <div className="relative inline-block mt-1" ref={taskListRef}>
              <button
                type="button"
                onClick={() => setShowTaskList((v) => !v)}
                className="text-sm text-gray-500 underline decoration-dotted underline-offset-2 hover:text-black"
              >
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} added
              </button>

              {showTaskList && (
                <div className="absolute right-0 top-full z-40 mt-1 w-72 border-2 border-black bg-white p-1 text-left shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  {tasks.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 px-2 py-1 hover:bg-gray-50"
                    >
                      <span className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => requestDeleteTask(i)}
                          aria-label={`Remove ${t.name}`}
                          className="text-gray-400 hover:text-black"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="text-sm truncate">{t.name}</span>
                      </span>
                      <span className="text-xs font-bold">
                        {roundUpToFibonacci(getPoints(t.selections))} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">
            Task name
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) saveAndNext();
            }}
            placeholder="Enter task title..."
            className="w-full border-2 border-black px-3 py-2.5 text-sm focus:outline-none focus:bg-gray-50 font-mono placeholder:text-gray-400"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-3">
            Criteria
          </label>
          <div className="space-y-1">
            {CRITERIA.map((criterion) => (
              <CriterionRow
                key={criterion.id}
                criterion={criterion}
                intensity={selections[criterion.id]}
                onToggle={() => toggleCriterion(criterion.id)}
                onSetIntensity={(level) => setIntensity(criterion.id, level)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <button
            onClick={saveAndNext}
            disabled={!canSubmit}
            className="border border-black px-5 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next task
          </button>
          <button
            onClick={handleFinish}
            disabled={!canFinish}
            className="bg-black text-white px-5 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800"
          >
            Finish
          </button>
        </div>
      </div>

      <Dialog open={showFinishWarning} onOpenChange={setShowFinishWarning}>
        <DialogContent>
          <DialogTitle>Complete this task before finishing?</DialogTitle>
          <DialogDescription>
            The current task is missing{" "}
            {[
              !trimmedName && "a task name",
              !hasSelections && "at least one criterion",
            ]
              .filter(Boolean)
              .join(" and ")}
            . Go back to finish it, or skip it and finish with your{" "}
            {tasks.length} added task{tasks.length !== 1 ? "s" : ""}.
          </DialogDescription>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <button className="border border-black px-4 py-2 text-sm hover:bg-gray-100">
                Go back
              </button>
            </DialogClose>
            <button
              onClick={finishSkippingCurrent}
              className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
            >
              Skip and finish
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {deleteDialog}
    </div>
  );
}
