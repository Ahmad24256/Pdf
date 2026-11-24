export const PdfDocument = {
  async open(path) {
    if (path.includes('corrupt')) {
      throw new Error('PoDoFo: invalid xref table');
    }
    return {
      pageCount: 1,
      getPage: () => ({
        width: 612,
        height: 792,
        createPainter: () => ({
          setFont() {},
          drawText() {},
          finishDrawing() {},
        }),
      }),
      getStandard14Font: () => ({}),
      save: async () => {},
    };
  },
};
