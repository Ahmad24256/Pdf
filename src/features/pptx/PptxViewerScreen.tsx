import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useConvertedIR } from '../../core/convert/useConvertedIR';
import type { DocumentMeta } from '../../types/document';
import EngineFallback from '../../ui/components/EngineFallback';
import IrBlocks from '../../ui/components/ir/IrBlocks';
import IrSlide from '../../ui/components/ir/IrSlide';
import type { IrPage } from '../../ui/components/ir/irTypes';

export default function PptxViewerScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  const state = useConvertedIR(doc);
  const [pageIndex, setPageIndex] = useState(0);
  const { width } = useWindowDimensions();

  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, paddingTop: 56 }}>
        <Header doc={doc} onBack={onBack} />
        <ActivityIndicator style={{ marginTop: 32 }} />
      </View>
    );
  }

  if (state.status === 'error') {
    return <EngineFallback title={doc.name} message={state.message} onBack={onBack} />;
  }

  const pages = state.ir.pages ?? [];

  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <Header doc={doc} onBack={onBack} subtitle={pages.length > 0 ? `Slide ${pageIndex + 1} of ${pages.length}` : undefined} />
      <FlatList
        data={pages}
        keyExtractor={(page: IrPage) => String(page.pageIndex)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => setPageIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width }}>
            {item.slide ? <IrSlide slide={item.slide} /> : <IrBlocks blocks={item.blocks} />}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: '#555' }}>This presentation has no slides.</Text>}
      />
    </View>
  );
}

function Header({ doc, onBack, subtitle }: { doc: DocumentMeta; onBack: () => void; subtitle?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>Back</Text>
      </Pressable>
      <Text style={{ flex: 1, marginLeft: 12, fontWeight: '700' }} numberOfLines={1}>
        {doc.name}
      </Text>
      {subtitle ? <Text style={{ color: '#666' }}>{subtitle}</Text> : null}
    </View>
  );
}
