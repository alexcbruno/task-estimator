import { ACCENT_COLORS, EXCLUSIONS, HAIR_COLORS, STYLE_BLOCK } from "../data/styleSystem";

export interface Character {
  hairStyle: string;
  hairColorId: string;
  skinToneId: string;
  pose: string;
  prop: string;
}

export function emptyCharacter(): Character {
  return {
    hairStyle: "",
    hairColorId: "",
    skinToneId: "",
    pose: "",
    prop: "",
  };
}

export function isCharacterComplete(c: Character): boolean {
  return !!(c.hairStyle && c.hairColorId && c.skinToneId);
}

export interface Brief {
  subject: string;
  characters: Character[];
  keyObjects: string[];
  heroObject: string | null;
  accentColorId: string;
  includeExclusions: boolean;
}

export function emptyBrief(): Brief {
  return {
    subject: "",
    characters: [],
    keyObjects: [],
    heroObject: null,
    accentColorId: "none",
    includeExclusions: true,
  };
}

function findLabel<T extends { id: string; label: string }>(
  list: T[],
  id: string,
): string {
  return list.find((item) => item.id === id)?.label ?? id;
}

function characterLine(c: Character, index: number): string {
  const lines = [
    `CHARACTER ${index + 1}:`,
    `  Hair: ${findLabel(HAIR_COLORS, c.hairColorId)}, ${c.hairStyle}`,
    `  Skin tone: ${c.skinToneId}`,
  ];
  if (c.pose.trim()) lines.push(`  Pose/action: ${c.pose.trim()}`);
  if (c.prop.trim()) lines.push(`  Holding/prop: ${c.prop.trim()}`);
  return lines.join("\n");
}

// Renders the Content Brief section using the same labeled-field template
// as the style guide's Section 4, filled in from the wizard's choices.
export function buildContentBrief(brief: Brief): string {
  const lines: string[] = [];
  if (brief.subject.trim()) {
    lines.push(`SUBJECT/ACTION: ${brief.subject.trim()}`);
  }

  if (brief.characters.length > 0) {
    if (lines.length > 0) lines.push("");
    lines.push(brief.characters.map(characterLine).join("\n\n"));
  }

  if (brief.keyObjects.length > 0) {
    const objectList = brief.keyObjects
      .map((o) =>
        brief.heroObject === o ? `${o} (drawn oversized as the hero object)` : o,
      )
      .join(", ");
    lines.push("");
    lines.push(`KEY OBJECTS/ICONS: ${objectList}`);
  }

  const accent = ACCENT_COLORS.find((a) => a.id === brief.accentColorId);
  lines.push("");
  lines.push(`ACCENT COLOR: ${accent?.label ?? "None"}`);

  return lines.join("\n");
}

// Combines the fixed Style Block with the per-generation Content Brief into
// one paste-ready prompt.
export function buildPrompt(brief: Brief): string {
  const sections = [STYLE_BLOCK, buildContentBrief(brief)];

  if (brief.includeExclusions) {
    sections.push(`EXCLUDE:\n${EXCLUSIONS}`);
  }

  return sections.filter(Boolean).join("\n\n");
}
