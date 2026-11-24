import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useConvertedIR } from '../../core/convert/useConvertedIR';
import type { DocumentMeta } from '../../types/document';
import { useTheme } from '../../ui/theme';
import EngineFallback from '../../ui/components/EngineFallback';
import ScreenHeader from '../../ui/components/ScreenHeader';
import IrBlocks from '../../ui/components/ir/IrBlocks';
import IrTableGrid from '../../ui/components/ir/IrTableGrid';
import type { IrPage } from '../../ui/components/ir/irTypes';

export default function XlsxViewerScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  const state = useConvertedIR(doc);
  const [sheetIndex, setSheetIndex] = useState(0);
  const { colors, spacing, radius, fontSize } = useTheme();

  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
        <ScreenHeader title={doc.name} onBack={onBack} />
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.accent} />
      </View>
    );
  }

  if (state.status === 'error') {
    return <EngineFallback title={doc.name} message={state.message} onBack={onBack} />;
  }

  const pages = state.ir.pages ?? [];
  const sheet = pages[Math.min(sheetIndex, Math.max(pages.length - 1, 0))];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <ScreenHeader title={doc.name} onBack={onBack} />
      {pages.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface }}
        >
          {pages.map((page, index) => (
            <Pressable
              key={page.pageIndex}
              onPress={() => setSheetIndex(index)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: index === sheetIndex ? colors.accent : 'transparent',
                borderRadius: radius.sm,
                marginHorizontal: spacing.xs,
              }}
            >
              <Text
                style={{
                  color: index === sheetIndex ? colors.onAccent : colors.text,
                  fontWeight: index === sheetIndex ? '700' : '400',
                  fontSize: fontSize.caption,
                }}
              >
                {page.name ?? `Sheet ${index + 1}`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {sheet ? (
        <SheetContent page={sheet} />
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 48, color: colors.textSecondary, fontSize: fontSize.body }}>
          This workbook has no sheets.
        </Text>
      )}
    </View>
  );
}

function SheetContent({ page }: { page: IrPage }) {
  const { colors } = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 8 }}>
      {(page.blocks ?? []).map((block, index) =>
        block.type === 'table' ? <IrTableGrid key={index} block={block} /> : <IrBlocks key={index} blocks={[block]} />,
      )}
    </ScrollView>
  );
}
