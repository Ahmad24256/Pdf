import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useConvertedIR } from '../../core/convert/useConvertedIR';
import type { DocumentMeta } from '../../types/document';
import EngineFallback from '../../ui/components/EngineFallback';
import IrBlocks from '../../ui/components/ir/IrBlocks';
import IrTableGrid from '../../ui/components/ir/IrTableGrid';
import type { IrPage } from '../../ui/components/ir/irTypes';

export default function XlsxViewerScreen({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  const state = useConvertedIR(doc);
  const [sheetIndex, setSheetIndex] = useState(0);

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
  const sheet = pages[Math.min(sheetIndex, Math.max(pages.length - 1, 0))];

  return (
    <View style={{ flex: 1, paddingTop: 56 }}>
      <Header doc={doc} onBack={onBack} />
      {pages.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          {pages.map((page, index) => (
            <Pressable
              key={page.pageIndex}
              onPress={() => setSheetIndex(index)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: index === sheetIndex ? '#0a7d6c' : 'transparent' }}
            >
              <Text style={{ color: index === sheetIndex ? '#fff' : '#333', fontWeight: index === sheetIndex ? '700' : '400' }}>
                {page.name ?? `Sheet ${index + 1}`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {sheet ? <SheetContent page={sheet} /> : (
        <Text style={{ textAlign: 'center', marginTop: 32, color: '#555' }}>This workbook has no sheets.</Text>
      )}
    </View>
  );
}

function Header({ doc, onBack }: { doc: DocumentMeta; onBack: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 }}>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={{ color: '#0a7d6c', fontWeight: '600' }}>Back</Text>
      </Pressable>
      <Text style={{ flex: 1, marginLeft: 12, fontWeight: '700' }} numberOfLines={1}>
        {doc.name}
      </Text>
    </View>
  );
}

function SheetContent({ page }: { page: IrPage }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8 }}>
      {(page.blocks ?? []).map((block, index) =>
        block.type === 'table' ? <IrTableGrid key={index} block={block} /> : <IrBlocks key={index} blocks={[block]} />,
      )}
    </ScrollView>
  );
}
