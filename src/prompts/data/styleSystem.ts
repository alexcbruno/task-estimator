// Encodes illustration-style-prompting-system-v2.md, adapted per direction to:
//   - always render in isometric perspective — this is now the only style
//     (dropped the flat-vignette and abstract-diagram modes, and the ground
//     device/background setting — characters are just optional per scene,
//     backgrounds are handled separately from this tool)
//   - drop the decorative orbit-line flourish
//   - push character wardrobe toward professional/industrial workwear
// The UI is driven entirely by the arrays below, nothing style-specific lives
// in App.tsx. Edit this file when the style guide changes.

export const STYLE_BLOCK = `Flat 2D vector illustration, minimalist corporate/SaaS style, rendered in isometric perspective throughout. Solid flat color fills only — no gradients, no outlines or strokes on shapes, no textures, no photorealism, no realistic lighting or drop shadows. Dimension is implied only through hard-edged two-tone (or three-tone, for isometric solids) color blocking: flat shades of the same hue applied to each plane of a shape, with a crisp straight edge between tones — never a blended gradient.

Objects (boxes, devices, platforms, vehicles) are built as clean isometric solids with exactly three visible faces, each a different flat shade of the same hue: lightest tone on the top face, medium tone on the left-facing plane, darkest tone on the right-facing plane.

Characters, when present, are simplified and completely faceless — no eyes, nose, mouth, or facial detail of any kind. Rounded, simplified hairstyles in flat color. Clothing reads as professional/industrial workwear — coveralls, work shirts, or utility vests over trousers, never casual streetwear — rendered as flat color blocks with the same two-tone shading rule (one seam splitting a lighter and darker version of the garment's color). Naturalistic, slightly athletic body proportions — not blocky or boxy — with grounded, confident posture, minimal joints, and simple flat work boots.

Composition: a single centered vignette with generous negative space, on a plain white background (#FFFFFF). No text or real UI copy inside the illustration itself — abstract rounded-rectangle bars stand in for text if needed.

Color palette restricted to: deep navy, primary blue, mid blue, sky blue, pale sky blue, plus warm flat skin tones. Use at most one semantic accent color (green, gold, or coral) only when it carries meaning (success, money, or warning/alert) — never as decoration.`;

export const EXCLUSIONS = `photorealistic, 3D render, gradient, soft drop shadow, glow, black outline, dark stroke, line border, contour line around any shape, detailed facial features, eyes, mouth, hair strand linework, texture, grain, noise, realistic lighting, cluttered background, more than two tones per garment or object, multiple accent colors in one piece, watermark, logo, real readable text, UI chrome or icons on screens unless specifically requested, casual/fashion clothing, blocky or boxy proportions`;

export interface Swatch {
  id: string;
  label: string;
  hex: string;
}

export const SKIN_TONES: Swatch[] = [
  { id: "A", label: "Skin tone A", hex: "#EEA886" },
  { id: "B", label: "Skin tone B", hex: "#FCBDBA" },
  { id: "C", label: "Skin tone C", hex: "#A0685B" },
  { id: "D", label: "Skin tone D", hex: "#F7BDA5" },
];

export const HAIR_STYLES: string[] = [
  "Short",
  "Long straight",
  "Wavy",
  "Curly",
  "Bun",
  "Ponytail",
  "Bald",
];

export const HAIR_COLORS: Swatch[] = [
  { id: "blonde", label: "Bright yellow (blonde)", hex: "#FBDF7E" },
  { id: "brown", label: "Brown", hex: "#995134" },
  { id: "charcoal", label: "Neutral charcoal", hex: "#473F47" },
];

export interface AccentColor {
  id: "none" | "green" | "gold" | "coral";
  label: string;
  hex?: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: "none", label: "None" },
  { id: "green", label: "Green — success", hex: "#00D793" },
  { id: "gold", label: "Gold — money", hex: "#D8A840" },
  { id: "coral", label: "Coral — warning", hex: "#FA6937" },
];

export const KEY_OBJECTS: string[] = [
  "Laptop",
  "Tablet",
  "Chart panel",
  "Truck",
  "Shield",
  "Coins",
  "Cloud",
  "Gear",
  "Puzzle piece",
  "Briefcase",
  "Potted plant",
  "Server rack",
];
