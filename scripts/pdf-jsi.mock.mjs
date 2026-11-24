import { __seed } from './expo-file-system.mock.mjs';

export const ExportFormat = { TEXT: 'text', JPEG: 'jpeg', PNG: 'png', PDF: 'pdf' };

export const ExportManager = {
  async exportPageToImage(filePath, page, options = {}) {
    const out = `/cache/thumb-${page}.png`;
    __seed(`file://${out}`, `PNG:${filePath}:${page}:${options.format ?? 'jpeg'}`);
    return out;
  },
};
