import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, useWindowDimensions } from 'react-native';
import { useConvertedIR } from '../../core/convert/useConvertedIR';
import type { DocumentMeta } from '../../types/document';
import { useTheme } from '../../ui/theme';
import EngineFallback from '../../ui/components/EngineFallback';
import ScreenHeader from '../../ui/components/ScreenHeader';
import IrBlocks from '../../ui/components/ir/IrBlocks';
import IrSlide from '../../ui/components/ir/IrSlide';
import type { IrPage } from '../../ui/components/ir/irTypes';

export default function PptxViewerScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  const state = useConvertedIR(doc);
  const [pageIndex, setPageIndex] = useState(0);
  const { width } = useWindowDimensions();
  const { colors, fontSize } = useTheme();

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <ScreenHeader
        title={doc.name}
        subtitle={pages.length > 0 ? `Slide ${pageIndex + 1} of ${pages.length}` : undefined}
        onBack={onBack}
      />
      <FlatList
        data={pages}
        keyExtractor={(page: IrPage) => String(page.pageIndex)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => setPageIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, backgroundColor: colors.background }}>
            {item.slide ? <IrSlide slide={item.slide} /> : <IrBlocks blocks={item.blocks} />}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 48, color: colors.textSecondary, fontSize: fontSize.body }}>
            This presentation has no slides.
          </Text>
        }
      />
    </View>
  );
}
