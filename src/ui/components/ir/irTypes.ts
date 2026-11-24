export interface IrRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface IrBlock {
  type: string;
  level?: number;
  runs?: IrRun[];
  columnWidths?: number[];
  rows?: IrTableCell[][];
}

export interface IrTableCell {
  paragraphs?: IrRun[][];
  background?: string;
}

export interface IrSlideParagraph {
  align?: string;
  runs?: IrRun[];
}

export interface IrShape {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: { type?: string; color?: string };
  text?: { paragraphs?: IrSlideParagraph[] };
}

export interface IrSlide {
  width: number;
  height: number;
  background?: { type?: string; color?: string };
  shapes?: IrShape[];
}

export interface IrPage {
  pageIndex: number;
  name?: string;
  blocks?: IrBlock[];
  slide?: IrSlide;
}

export interface DocumentIR {
  version?: number;
  sourceType?: string;
  pages?: IrPage[];
}
