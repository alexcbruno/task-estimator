export interface Criterion {
  id: string;
  label: string;
  points: number;
}

// Edit this array to add, remove, or reweight criteria.
// Point values are hidden from the user during estimation.
export const CRITERIA: Criterion[] = [
  { id: "base-value", label: "Is this task worth tracking?", points: 1 },
  { id: "net-new", label: "Is this net new design work?", points: 2 },
  {
    id: "affected-users",
    label: "Does this design task affect multiple user types?",
    points: 2,
  },
  {
    id: "affected-platforms",
    label: "Does this task touch multiple platforms?",
    points: 1,
  },
  { id: "new-data", label: "Are we introducing new data fields?", points: 1.5 },
  {
    id: "edge-cases",
    label: "Are error and/or empty states required?",
    points: 0.5,
  },
  {
    id: "tech-limits",
    label:
      "Are there technical limitations in place that need to be reevaluated?",
    points: 1.5,
  },
  { id: "ux-copy", label: "Is there new UX copy to introduce?", points: 1.5 },
  {
    id: "additional-research",
    label: "Is any additional research required?",
    points: 1,
  },
  {
    id: "new-image-assets",
    label: "Will there be new illustrations, 3D images, or animations?",
    points: 2,
  },
  {
    id: "waiting-on-info",
    label: "Am I waiting on information from anyone?",
    points: 2,
  },
  {
    id: "collaborators",
    label: "Do I need to collaborate with others on this task?",
    points: 2,
  },
  {
    id: "stakeholder-review",
    label: "How many stakeholders will review this?",
    points: 1,
  },
];
