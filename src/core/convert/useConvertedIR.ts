import { useEffect, useState } from 'react';
import type { DocumentMeta } from '../../types/document';
import type { DocumentIR } from '../../ui/components/ir/irTypes';
import { AppError, toUserMessage } from '../errors';
import { convertFileToIr, isAnydocAvailable } from './anydocAdapter';

export type IrLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; ir: DocumentIR };

export function useConvertedIR(doc: DocumentMeta): IrLoadState {
  const [state, setState] = useState<IrLoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isAnydocAvailable()) {
          throw new AppError('The document converter is unavailable in this build.');
        }
        const outcome = await convertFileToIr(doc.uri);
        if (cancelled) return;
        if (!outcome.ok) {
          setState({ status: 'error', message: `This file could not be parsed (${outcome.reason}).` });
          return;
        }
        setState({ status: 'ok', ir: outcome.ir as DocumentIR });
      } catch (error) {
        if (!cancelled) setState({ status: 'error', message: toUserMessage(error) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc.uri]);

  return state;
}
