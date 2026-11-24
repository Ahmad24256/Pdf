import { Text, View } from 'react-native';
import type { IrBlock, IrRun, IrTableCell } from './irTypes';

export function IrRuns({ runs }: { runs?: IrRun[] }) {
  if (!runs?.length) return null;
  return (
    <>
      {runs.map((run, index) => (
        <Text
          key={index}
          style={{
            fontWeight: run.bold ? '700' : '400',
            fontStyle: run.italic ? 'italic' : 'normal',
            fontSize: run.fontSize,
            fontFamily: run.fontFamily,
            color: run.color ?? '#000000',
            textDecorationLine: run.underline ? 'underline' : 'none',
          }}
        >
          {run.text}
        </Text>
      ))}
    </>
  );
}

function cellText(cell: IrTableCell): string {
  return (cell.paragraphs ?? []).map((runs) => runs.map((run) => run.text).join('')).join('\n');
}

export default function IrBlocks({ blocks }: { blocks?: IrBlock[] }) {
  return (
    <View style={{ padding: 16 }}>
      {(blocks ?? []).map((block, index) => {
        if (block.type === 'heading') {
          return (
            <Text key={index} style={{ fontSize: Math.max(16, 24 - (block.level ?? 1) * 2), fontWeight: '700', marginVertical: 6 }}>
              <IrRuns runs={block.runs} />
            </Text>
          );
        }
        if (block.type === 'table') {
          return (
            <View key={index} style={{ marginVertical: 6 }}>
              {(block.rows ?? []).map((row, rowIndex) => (
                <Text key={rowIndex} style={{ fontSize: 14 }}>
                  {(row ?? []).map((cell, cellIndex) => `${cellText(cell)}${cellIndex < row.length - 1 ? ' | ' : ''}`)}
                </Text>
              ))}
            </View>
          );
        }
        if (block.type === 'image') return <Text key={index} style={{ color: '#666', marginVertical: 4 }}>[Image]</Text>;
        if (block.type === 'chart') return <Text key={index} style={{ color: '#666', marginVertical: 4 }}>[Chart]</Text>;
        return (
          <Text key={index} style={{ fontSize: 16, marginVertical: 4 }}>
            <IrRuns runs={block.runs} />
          </Text>
        );
      })}
    </View>
  );
}
