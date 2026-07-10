import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

/** Port de drawElev (index.html:4275-4292) — courbe d'élévation en SVG plutôt qu'en canvas. */
export function ElevationChart({ elevations, color, height = 40 }: { elevations: number[]; color: string; height?: number }) {
  const [width, setWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  if (!elevations || elevations.length < 2 || width === 0) {
    return <View style={[styles.container, { height }]} onLayout={onLayout} />;
  }

  const sub = elevations.filter((_, i) => i % Math.max(1, Math.floor(elevations.length / 80)) === 0);
  const min = Math.min(...sub);
  const max = Math.max(...sub);
  const range = max - min || 1;
  const pts = sub.map((e, i) => ({
    x: (i / (sub.length - 1)) * width,
    y: height - ((e - min) / range) * (height * 0.85) - height * 0.05,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `M0,${height} ${pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L${width},${height} Z`;

  return (
    <View style={[styles.container, { height }]} onLayout={onLayout}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.33} />
            <Stop offset="1" stopColor={color} stopOpacity={0.03} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#fade)" />
        <Path d={linePath} stroke={color} strokeWidth={1.5} fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
