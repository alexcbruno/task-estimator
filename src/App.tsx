import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, RotateCcw } from 'lucide-react'
import { CRITERIA, type Criterion } from './data/criteria'
import {
  getPoints,
  roundUpToFibonacci,
  cn,
  type Intensity,
  type Selections,
} from './lib/utils'
import { Checkbox } from './components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './components/ui/dialog'
import './index.css'

interface Task {
  name: string
  selections: Selections
}

type View = 'entry' | 'results'

const INTENSITY_LEVELS: { value: Intensity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Med' },
  { value: 'high', label: 'High' },
]

// The first criterion is always checked — tracking a task at all is the baseline.
const REQUIRED_ID = CRITERIA[0].id
const defaultSelections = (): Selections => ({ [REQUIRED_ID]: 'high' })

// Round to at most 2 decimals and drop trailing zeros for display.
function fmt(n: number): string {
  return String(Math.round(n * 100) / 100)
}

function CriterionRow({
  criterion,
  intensity,
  onToggle,
  onSetIntensity,
  required,
}: {
  criterion: Criterion
  intensity: Intensity | undefined
  onToggle: () => void
  onSetIntensity: (level: Intensity) => void
  required?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 py-1 min-h-[28px]',
        required && 'opacity-50 cursor-not-allowed'
      )}
    >
      <label
        className={cn(
          'flex items-start gap-3 group flex-1 min-w-0',
          required ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <Checkbox
          checked={!!intensity}
          onCheckedChange={onToggle}
          disabled={required}
          className={cn('mt-0.5', required && 'disabled:opacity-100')}
        />
        <span
          className={cn(
            'text-sm',
            !required && 'group-hover:underline underline-offset-2'
          )}
        >
          {criterion.label}
        </span>
      </label>

      {/* Always reserve space for the intensity group so the label wraps consistently. */}
      <div
        className={cn(
          'shrink-0 flex border border-black',
          !intensity && 'invisible pointer-events-none'
        )}
      >
        {INTENSITY_LEVELS.map(level => (
          <button
            key={level.value}
            type="button"
            disabled={required}
            onClick={() => onSetIntensity(level.value)}
            className={cn(
              'px-2 py-0.5 text-xs uppercase tracking-wide border-l border-black first:border-l-0',
              required && 'cursor-not-allowed',
              intensity === level.value
                ? 'bg-black text-white'
                : 'bg-white text-black',
              !required && intensity !== level.value && 'hover:bg-gray-100'
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('entry')
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskName, setTaskName] = useState('')
  const [selections, setSelections] = useState<Selections>(defaultSelections)
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [copied, setCopied] = useState(false)

  const canSubmit = taskName.trim().length > 0

  function saveAndNext() {
    setTasks(prev => [...prev, { name: taskName.trim(), selections }])
    setTaskName('')
    setSelections(defaultSelections())
  }

  function saveAndFinish() {
    const finalTasks = [...tasks, { name: taskName.trim(), selections }]
    setTasks(finalTasks)
    setView('results')
  }

  // Toggle a criterion in the in-progress entry. Defaults to "high" when checked.
  function toggleCriterion(id: string) {
    if (id === REQUIRED_ID) return
    setSelections(prev => {
      if (prev[id]) {
        const { [id]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: 'high' }
    })
  }

  function setIntensity(id: string, level: Intensity) {
    setSelections(prev => ({ ...prev, [id]: level }))
  }

  function toggleTaskCriterion(taskIndex: number, id: string) {
    if (id === REQUIRED_ID) return
    setTasks(prev =>
      prev.map((task, i) => {
        if (i !== taskIndex) return task
        if (task.selections[id]) {
          const { [id]: _removed, ...rest } = task.selections
          return { ...task, selections: rest }
        }
        return { ...task, selections: { ...task.selections, [id]: 'high' } }
      })
    )
  }

  function setTaskIntensity(taskIndex: number, id: string, level: Intensity) {
    setTasks(prev =>
      prev.map((task, i) =>
        i === taskIndex
          ? { ...task, selections: { ...task.selections, [id]: level } }
          : task
      )
    )
  }

  function handleCopy() {
    const lines = tasks.map(task => {
      const fib = roundUpToFibonacci(getPoints(task.selections))
      return `${task.name}: ${fib}`
    })
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleStartOver() {
    setTasks([])
    setTaskName('')
    setSelections(defaultSelections())
    setExpandedTask(null)
    setShowConfirmReset(false)
    setView('entry')
  }

  // ── Results view ──────────────────────────────────────────────────────────────
  if (view === 'results') {
    const totalFib = tasks.reduce(
      (sum, t) => sum + roundUpToFibonacci(getPoints(t.selections)),
      0
    )

    return (
      <div className="min-h-screen bg-white text-black font-mono">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Estimation Results</h1>
          </div>

          <div className="text-xs uppercase tracking-widest mb-1">Total</div>
          <div className="text-4xl font-bold mb-8">{totalFib} pts</div>

          <div className="border-t-2 border-black">
            {tasks.map((task, i) => {
              const rawPts = getPoints(task.selections)
              const fibPts = roundUpToFibonacci(rawPts)
              const isExpanded = expandedTask === i

              return (
                <div key={i} className="border-b border-black">
                  <button
                    className="w-full text-left px-0 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedTask(isExpanded ? null : i)}
                  >
                    <span className="font-medium truncate pr-4">{task.name}</span>
                    <span className="shrink-0 flex items-center gap-3 text-sm">
                      <span className="text-gray-400">{fmt(rawPts)} pts</span>
                      <span className="font-bold">{fibPts} pts</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pb-4 pt-2 px-4 space-y-1 border-t border-dashed border-black bg-gray-50">
                      {CRITERIA.map(criterion => (
                        <CriterionRow
                          key={criterion.id}
                          criterion={criterion}
                          intensity={task.selections[criterion.id]}
                          onToggle={() => toggleTaskCriterion(i, criterion.id)}
                          onSetIntensity={level =>
                            setTaskIntensity(i, criterion.id, level)
                          }
                          required={criterion.id === REQUIRED_ID}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-2 border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy list'}
            </button>
          </div>
        </div>

        <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
          <DialogContent>
            <DialogTitle>Start over?</DialogTitle>
            <DialogDescription>
              All {tasks.length} task{tasks.length !== 1 ? 's' : ''} will be deleted. This cannot be undone.
            </DialogDescription>
            <div className="flex gap-3 justify-end">
              <DialogClose asChild>
                <button className="border border-black px-4 py-2 text-sm hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              </DialogClose>
              <button
                onClick={handleStartOver}
                className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
              >
                Reset
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── Entry view ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="border-b-2 border-black pb-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Task Estimator</h1>
          {tasks.length > 0 && (
            <p className="text-sm mt-1 text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} saved — add another
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">
            Task name
          </label>
          <input
            type="text"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && canSubmit) saveAndNext()
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
            {CRITERIA.map(criterion => (
              <CriterionRow
                key={criterion.id}
                criterion={criterion}
                intensity={selections[criterion.id]}
                onToggle={() => toggleCriterion(criterion.id)}
                onSetIntensity={level => setIntensity(criterion.id, level)}
                required={criterion.id === REQUIRED_ID}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <button
            onClick={saveAndNext}
            disabled={!canSubmit}
            className="border border-black px-5 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            Next task
          </button>
          <button
            onClick={saveAndFinish}
            disabled={!canSubmit}
            className="bg-black text-white px-5 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  )
}
