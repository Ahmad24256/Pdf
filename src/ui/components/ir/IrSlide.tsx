import { Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme';
import type { IrShape, IrSlide as IrSlideData } from './irTypes';
import { IrRuns } from './IrBlocks';

type TextAlign = 'left' | 'center' | 'right' | 'justify';

function toTextAlign(align?: string): TextAlign {
  return align === 'center' || align === 'right' || align === 'justify' ? align : 'left';
}

function ShapeView({ shape, scale }: { shape: IrShape; scale: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: shape.x * scale,
        top: shape.y * scale,
        width: shape.width * scale,
        height: shape.height * scale,
        backgroundColor: shape.fill?.type === 'solid' ? shape.fill.color : 'transparent',
        overflow: 'hidden',
      }}
    >
      {(shape.text?.paragraphs ?? []).map((paragraph, index) => (
        <Text key={index} style={{ textAlign: toTextAlign(paragraph.align), padding: 4 }}>
          <IrRuns runs={paragraph.runs} />
        </Text>
      ))}
    </View>
  );
}

export default function IrSlide({ slide }: { slide: IrSlideData }) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const scale = screenWidth / slide.width;
  return (
    <View
      style={{
        width: screenWidth,
        height: slide.height * scale,
        backgroundColor: slide.background?.type === 'solid' ? slide.background.color : colors.surface,
        overflow: 'hidden',
      }}
    >
      {(slide.shapes ?? []).map((shape, index) => (
        <ShapeView key={index} shape={shape} scale={scale} />
      ))}
    </View>
  );
}
