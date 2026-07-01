export interface Criterion {
  id: string;
  label: string;
  points: number;
}

// Edit this array to add, remove, or reweight criteria.
// Point values are hidden from the user during estimation.
export const CRITERIA: Criterion[] = [
  {
    id: "net-new",
    label: "Requires brand new flows or components",
    points: 1.5,
  },
  {
    id: "affected-users",
    label: "Affects multiple user types",
    points: 1.5,
  },
  {
    id: "affected-platforms",
    label: "Touches multiple platforms",
    points: 1.5,
  },
  { id: "new-data", label: "Requires new data fields", points: 1 },
  {
    id: "edge-cases",
    label: "Requires error and/or empty states",
    points: 1,
  },
  { id: "ux-copy", label: "Requires new UX copy", points: 1.5 },
  {
    id: "additional-research",
    label:
      "Requires additional research or reevaluation of existing technical limitations",
    points: 2,
  },
  {
    id: "user-flows",
    label: "Requires user flows",
    points: 1,
  },
  {
    id: "wireframes-sketches",
    label: "Requires wireframes or sketches",
    points: 1,
  },
  {
    id: "mockups",
    label: "Requires mockups",
    points: 1,
  },
  {
    id: "prototype",
    label: "Requires a prototype",
    points: 2,
  },
  {
    id: "new-image-assets",
    label: "Requires new illustrations, 3D images, or animations",
    points: 2,
  },
  {
    id: "waiting-on-info",
    label: "Requires outstanding information from someone",
    points: 2,
  },
  {
    id: "collaborators",
    label: "Requires collaboration with others",
    points: 1,
  },
  {
    id: "stakeholder-review",
    label: "Requires stakeholder review",
    points: 1,
  },
];
