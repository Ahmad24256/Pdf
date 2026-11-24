import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { IrBlock, IrTableCell } from './irTypes';

function cellText(cell: IrTableCell): string {
  return (cell.paragraphs ?? []).map((runs) => runs.map((run) => run.text).join('')).join('\n');
}

export default function IrTableGrid({ block }: { block: IrBlock }) {
  const { colors, spacing, fontSize } = useTheme();
  return (
    <ScrollView horizontal style={{ marginVertical: spacing.sm }}>
      <View>
        {(block.rows ?? []).map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row' }}>
            {(row ?? []).map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 6,
                  minWidth: 80,
                  backgroundColor: colors.surface,
                }}
              >
                <Text style={{ fontSize: fontSize.caption + 1, color: colors.text }}>{cellText(cell)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
