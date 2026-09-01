import { useState } from "react";
import { Copy, Plus, RotateCcw, X } from "lucide-react";
import {
  ACCENT_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  KEY_OBJECTS,
  SKIN_TONES,
} from "./data/styleSystem";
import {
  buildPrompt,
  emptyBrief,
  emptyCharacter,
  isCharacterComplete,
  type Brief,
  type Character,
} from "./lib/prompt";
import { cn } from "../lib/utils";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../components/ui/dialog";
import "../index.css";

type Step = "subject" | "characters" | "objects" | "accent" | "review";

const STEPS: Step[] = ["subject", "characters", "objects", "accent", "review"];

const STEP_LABELS: Record<Step, string> = {
  subject: "Subject",
  characters: "Characters",
  objects: "Key objects",
  accent: "Accent color",
  review: "Review",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest mb-2">
      {children}
    </label>
  );
}

function SwatchButton({
  swatch,
  selected,
  onClick,
}: {
  swatch: { id: string; label: string; hex?: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={swatch.label}
      className={cn(
        "flex items-center gap-2 border-2 border-black px-2.5 py-1.5 text-xs",
        selected ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100",
      )}
    >
      {swatch.hex && (
        <span
          className="h-3.5 w-3.5 shrink-0 border border-black/40"
          style={{ backgroundColor: swatch.hex }}
        />
      )}
      {swatch.label}
    </button>
  );
}

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-2 border-black px-2.5 py-1.5 text-xs",
        selected ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100",
      )}
    >
      {label}
    </button>
  );
}

function characterSummary(c: Character): string {
  const hair = [c.hairStyle, HAIR_COLORS.find((h) => h.id === c.hairColorId)?.label]
    .filter(Boolean)
    .join(" ");
  const parts = [hair && `${hair} hair`, `skin ${c.skinToneId}`, c.pose.trim()].filter(
    Boolean,
  );
  return parts.join(" — ");
}

export default function App() {
  const [brief, setBrief] = useState<Brief>(emptyBrief());
  const [step, setStep] = useState<Step>("subject");
  const [draftCharacter, setDraftCharacter] = useState<Character>(emptyCharacter());
  const [customObject, setCustomObject] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  function goNext() {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  }

  function goBack() {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  }

  function addCharacter() {
    if (!isCharacterComplete(draftCharacter)) return;
    setBrief((prev) => ({ ...prev, characters: [...prev.characters, draftCharacter] }));
    setDraftCharacter(emptyCharacter());
  }

  function removeCharacter(index: number) {
    setBrief((prev) => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== index),
    }));
  }

  function toggleKeyObject(label: string) {
    setBrief((prev) => {
      const has = prev.keyObjects.includes(label);
      return {
        ...prev,
        keyObjects: has
          ? prev.keyObjects.filter((o) => o !== label)
          : [...prev.keyObjects, label],
        heroObject: has && prev.heroObject === label ? null : prev.heroObject,
      };
    });
  }

  function addCustomObject() {
    const trimmed = customObject.trim();
    if (!trimmed || brief.keyObjects.includes(trimmed)) return;
    setBrief((prev) => ({ ...prev, keyObjects: [...prev.keyObjects, trimmed] }));
    setCustomObject("");
  }

  function toggleHeroObject(label: string) {
    setBrief((prev) => ({
      ...prev,
      heroObject: prev.heroObject === label ? null : label,
    }));
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildPrompt(brief));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleStartOver() {
    setBrief(emptyBrief());
    setDraftCharacter(emptyCharacter());
    setCustomObject("");
    setShowConfirmReset(false);
    setStep("subject");
  }

  const canGoNext =
    (step === "subject" && brief.subject.trim().length > 0) ||
    step === "characters" ||
    step === "objects" ||
    step === "accent";

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex justify-between items-baseline border-b-2 border-black pb-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Illustration Prompt Builder</h1>
          {step !== "review" && (
            <span className="text-xs text-gray-500 uppercase tracking-widest shrink-0 pl-4">
              Step {stepIndex + 1} of {STEPS.length} — {STEP_LABELS[step]}
            </span>
          )}
        </div>

        {step === "subject" && (
          <div>
            <FieldLabel>Subject / action</FieldLabel>
            <p className="text-xs text-gray-500 mb-3">
              One sentence — what's happening in this illustration.
            </p>
            <input
              type="text"
              value={brief.subject}
              onChange={(e) => setBrief((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g. Two coworkers shake hands after closing a deal"
              className="w-full border-2 border-black px-3 py-2.5 text-sm focus:outline-none focus:bg-gray-50 font-mono placeholder:text-gray-400"
              autoFocus
            />
          </div>
        )}

        {step === "characters" && (
          <div>
            <FieldLabel>Characters</FieldLabel>
            <p className="text-xs text-gray-500 mb-3">
              Optional — leave empty for an object-only isometric scene.
            </p>

            {brief.characters.length > 0 && (
              <div className="border-2 border-black mb-4">
                {brief.characters.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 px-3 py-2 border-b border-black last:border-b-0"
                  >
                    <span className="text-sm truncate">
                      <span className="font-bold">{i + 1}.</span>{" "}
                      {characterSummary(c) || "Untitled character"}
                    </span>
                    <button
                      onClick={() => removeCharacter(i)}
                      aria-label={`Remove character ${i + 1}`}
                      className="shrink-0 text-gray-400 hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-black p-4 space-y-4">
              <div>
                <FieldLabel>Hair style</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {HAIR_STYLES.map((style) => (
                    <ChoiceButton
                      key={style}
                      label={style}
                      selected={draftCharacter.hairStyle === style}
                      onClick={() =>
                        setDraftCharacter((prev) => ({ ...prev, hairStyle: style }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>Hair color</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map((swatch) => (
                    <SwatchButton
                      key={swatch.id}
                      swatch={swatch}
                      selected={draftCharacter.hairColorId === swatch.id}
                      onClick={() =>
                        setDraftCharacter((prev) => ({ ...prev, hairColorId: swatch.id }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>Skin tone</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TONES.map((swatch) => (
                    <SwatchButton
                      key={swatch.id}
                      swatch={swatch}
                      selected={draftCharacter.skinToneId === swatch.id}
                      onClick={() =>
                        setDraftCharacter((prev) => ({ ...prev, skinToneId: swatch.id }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Pose / action</FieldLabel>
                  <input
                    type="text"
                    value={draftCharacter.pose}
                    onChange={(e) =>
                      setDraftCharacter((prev) => ({ ...prev, pose: e.target.value }))
                    }
                    placeholder="e.g. arm extended, shaking hands"
                    className="w-full border-2 border-black px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <FieldLabel>Holding / prop</FieldLabel>
                  <input
                    type="text"
                    value={draftCharacter.prop}
                    onChange={(e) =>
                      setDraftCharacter((prev) => ({ ...prev, prop: e.target.value }))
                    }
                    placeholder="e.g. leather briefcase"
                    className="w-full border-2 border-black px-3 py-2 text-sm focus:outline-none focus:bg-white font-mono placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addCharacter}
                disabled={!isCharacterComplete(draftCharacter)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add character
              </button>
            </div>
          </div>
        )}

        {step === "objects" && (
          <div>
            <FieldLabel>Key objects / icons</FieldLabel>
            <p className="text-xs text-gray-500 mb-3">
              Pick everything that literally appears in the scene. Optional.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {KEY_OBJECTS.map((obj) => (
                <ChoiceButton
                  key={obj}
                  label={obj}
                  selected={brief.keyObjects.includes(obj)}
                  onClick={() => toggleKeyObject(obj)}
                />
              ))}
              {brief.keyObjects
                .filter((o) => !KEY_OBJECTS.includes(o))
                .map((obj) => (
                  <ChoiceButton
                    key={obj}
                    label={obj}
                    selected
                    onClick={() => toggleKeyObject(obj)}
                  />
                ))}
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={customObject}
                onChange={(e) => setCustomObject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustomObject();
                }}
                placeholder="Add a custom object..."
                className="flex-1 border-2 border-black px-3 py-2 text-sm focus:outline-none focus:bg-gray-50 font-mono placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={addCustomObject}
                disabled={!customObject.trim()}
                className="border border-black px-4 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Add
              </button>
            </div>

            {brief.keyObjects.length > 0 && (
              <div>
                <FieldLabel>Hero object (optional)</FieldLabel>
                <p className="text-xs text-gray-500 mb-3">
                  Drawn oversized relative to the rest of the scene for emphasis.
                </p>
                <div className="flex flex-wrap gap-2">
                  {brief.keyObjects.map((obj) => (
                    <ChoiceButton
                      key={obj}
                      label={obj}
                      selected={brief.heroObject === obj}
                      onClick={() => toggleHeroObject(obj)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === "accent" && (
          <div>
            <FieldLabel>Accent color</FieldLabel>
            <p className="text-xs text-gray-500 mb-3">
              At most one — only when it carries meaning.
            </p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((a) => (
                <SwatchButton
                  key={a.id}
                  swatch={a}
                  selected={brief.accentColorId === a.id}
                  onClick={() => setBrief((prev) => ({ ...prev, accentColorId: a.id }))}
                />
              ))}
            </div>
          </div>
        )}

        {step === "review" && (
          <div>
            <div className="border-b-2 border-black pb-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={brief.includeExclusions}
                  onCheckedChange={() =>
                    setBrief((prev) => ({
                      ...prev,
                      includeExclusions: !prev.includeExclusions,
                    }))
                  }
                />
                <span className="text-sm">
                  Include exclusions (negative prompt) block
                </span>
              </label>
            </div>

            <FieldLabel>Unified prompt</FieldLabel>
            <pre className="border-2 border-black bg-gray-50 p-4 text-xs whitespace-pre-wrap break-words mb-6 max-h-[28rem] overflow-y-auto">
              {buildPrompt(brief)}
            </pre>

            <div className="flex justify-between">
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
                {copied ? "Copied!" : "Copy prompt"}
              </button>
            </div>
          </div>
        )}

        {step !== "review" && (
          <div className="flex justify-end gap-3 mt-10">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="border border-black px-5 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="bg-black text-white px-5 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="mt-4">
            <button
              onClick={goBack}
              className="border border-black px-5 py-2 text-sm hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        )}
      </div>

      <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <DialogContent>
          <DialogTitle>Start over?</DialogTitle>
          <DialogDescription>
            All choices will be cleared. This cannot be undone.
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
    </div>
  );
}
