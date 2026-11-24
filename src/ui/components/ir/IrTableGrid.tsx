import { ScrollView, Text, View } from 'react-native';
import type { IrBlock, IrTableCell } from './irTypes';

function cellText(cell: IrTableCell): string {
  return (cell.paragraphs ?? []).map((runs) => runs.map((run) => run.text).join('')).join('\n');
}

export default function IrTableGrid({ block }: { block: IrBlock }) {
  return (
    <ScrollView horizontal style={{ marginVertical: 6 }}>
      <View>
        {(block.rows ?? []).map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row' }}>
            {(row ?? []).map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={{
                  borderWidth: 1,
                  borderColor: '#cccccc',
                  padding: 6,
                  minWidth: 80,
                  backgroundColor: cell.background ?? '#ffffff',
                }}
              >
                <Text style={{ fontSize: 13 }}>{cellText(cell)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
