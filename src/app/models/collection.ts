export interface Collection {
  id: string;
  name: string;
  selectedForms: string[];
  caught: string[];
  shiny: string[];
  showGenderDifferences: boolean;
  createdAt: number
}