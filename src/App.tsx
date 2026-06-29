import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, RotateCcw } from 'lucide-react'
import { CRITERIA } from './data/criteria'
import { getPoints, roundUpToFibonacci } from './lib/utils'
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
  selectedCriteria: string[]
}

type View = 'entry' | 'results'

export default function App() {
  const [view, setView] = useState<View>('entry')
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskName, setTaskName] = useState('')
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [copied, setCopied] = useState(false)

  const canSubmit = taskName.trim().length > 0

  function saveAndNext() {
    setTasks(prev => [...prev, { name: taskName.trim(), selectedCriteria }])
    setTaskName('')
    setSelectedCriteria([])
  }

  function saveAndFinish() {
    const finalTasks = [...tasks, { name: taskName.trim(), selectedCriteria }]
    setTasks(finalTasks)
    setView('results')
  }

  function toggleCriterion(id: string) {
    setSelectedCriteria(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function updateTaskCriteria(taskIndex: number, criterionId: string) {
    setTasks(prev =>
      prev.map((task, i) => {
        if (i !== taskIndex) return task
        const has = task.selectedCriteria.includes(criterionId)
        return {
          ...task,
          selectedCriteria: has
            ? task.selectedCriteria.filter(x => x !== criterionId)
            : [...task.selectedCriteria, criterionId],
        }
      })
    )
  }

  function handleCopy() {
    const lines = tasks.map(task => {
      const fib = roundUpToFibonacci(getPoints(task.selectedCriteria))
      return `${task.name}: ${fib}`
    })
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleStartOver() {
    setTasks([])
    setTaskName('')
    setSelectedCriteria([])
    setExpandedTask(null)
    setShowConfirmReset(false)
    setView('entry')
  }

  // ── Results view ──────────────────────────────────────────────────────────────
  if (view === 'results') {
    const totalFib = tasks.reduce(
      (sum, t) => sum + roundUpToFibonacci(getPoints(t.selectedCriteria)),
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
              const rawPts = getPoints(task.selectedCriteria)
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
                      <span className="text-gray-400">{rawPts} pts</span>
                      <span className="font-bold">{fibPts} pts</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pb-4 pt-2 px-4 space-y-2 border-t border-dashed border-black bg-gray-50">
                      {CRITERIA.map(criterion => (
                        <label
                          key={criterion.id}
                          className="flex items-center gap-3 cursor-pointer py-0.5"
                        >
                          <Checkbox
                            checked={task.selectedCriteria.includes(criterion.id)}
                            onCheckedChange={() => updateTaskCriteria(i, criterion.id)}
                          />
                          <span className="text-sm">{criterion.label}</span>
                        </label>
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
          <div className="space-y-2">
            {CRITERIA.map(criterion => (
              <label
                key={criterion.id}
                className="flex items-center gap-3 cursor-pointer group py-0.5"
              >
                <Checkbox
                  checked={selectedCriteria.includes(criterion.id)}
                  onCheckedChange={() => toggleCriterion(criterion.id)}
                />
                <span className="text-sm group-hover:underline underline-offset-2">
                  {criterion.label}
                </span>
              </label>
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
