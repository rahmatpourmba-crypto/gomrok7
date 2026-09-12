import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0b0f1a',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: '#f5c518',
          opacity,
        }}
      >
        Hello Remotion
      </div>
      <div style={{fontSize: 32, color: '#ffffff', marginTop: 20}}>
        Test Composition
      </div>
    </AbsoluteFill>
  );
};
