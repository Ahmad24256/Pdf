import { Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { IrBlock, IrRun, IrTableCell } from './irTypes';

export function IrRuns({ runs }: { runs?: IrRun[] }) {
  const { colors } = useTheme();
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
            color: run.color ?? colors.text,
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
  const { colors, spacing, fontSize } = useTheme();
  return (
    <View style={{ padding: spacing.md }}>
      {(blocks ?? []).map((block, index) => {
        if (block.type === 'heading') {
          return (
            <Text
              key={index}
              style={{
                fontSize: Math.max(16, 24 - (block.level ?? 1) * 2),
                fontWeight: '700',
                marginVertical: 6,
                color: colors.text,
              }}
            >
              <IrRuns runs={block.runs} />
            </Text>
          );
        }
        if (block.type === 'table') {
          return (
            <View key={index} style={{ marginVertical: 6 }}>
              {(block.rows ?? []).map((row, rowIndex) => (
                <Text key={rowIndex} style={{ fontSize: fontSize.body - 2, color: colors.text }}>
                  {(row ?? []).map((cell, cellIndex) => `${cellText(cell)}${cellIndex < row.length - 1 ? ' | ' : ''}`)}
                </Text>
              ))}
            </View>
          );
        }
        if (block.type === 'image') {
          return (
            <Text key={index} style={{ color: colors.textSecondary, marginVertical: 4, fontSize: fontSize.body }}>
              [Image]
            </Text>
          );
        }
        if (block.type === 'chart') {
          return (
            <Text key={index} style={{ color: colors.textSecondary, marginVertical: 4, fontSize: fontSize.body }}>
              [Chart]
            </Text>
          );
        }
        return (
          <Text key={index} style={{ fontSize: fontSize.body, marginVertical: 4, color: colors.text }}>
            <IrRuns runs={block.runs} />
          </Text>
        );
      })}
    </View>
  );
}
