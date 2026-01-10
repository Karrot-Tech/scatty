import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { ScattyState } from '@scatty/shared';

interface Props {
  state: ScattyState;
}

const COLORS = {
  idle: '#64748B',
  listening: '#3B82F6',
  thinking: '#F59E0B',
  speaking: '#10B981',
  looking: '#8B5CF6',
};

export function ScattyAvatar({ state }: Props) {
  // Animation values
  const leftAntennaRotate = useSharedValue(0);
  const rightAntennaRotate = useSharedValue(0);
  const leftPupilX = useSharedValue(0);
  const rightPupilX = useSharedValue(0);
  const eyeScale = useSharedValue(1);
  const mouthWidth = useSharedValue(20);
  const glowOpacity = useSharedValue(0.3);
  const bodyScale = useSharedValue(1);

  // Update animations based on state
  useEffect(() => {
    cancelAnimation(leftAntennaRotate);
    cancelAnimation(rightAntennaRotate);
    cancelAnimation(leftPupilX);
    cancelAnimation(glowOpacity);
    cancelAnimation(bodyScale);

    switch (state) {
      case 'idle':
        leftAntennaRotate.value = withSpring(0);
        rightAntennaRotate.value = withSpring(0);
        eyeScale.value = withTiming(0.3, { duration: 200 }); // Eyes partially closed
        mouthWidth.value = withTiming(20, { duration: 200 });
        glowOpacity.value = withTiming(0.2, { duration: 300 });
        bodyScale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'listening':
        leftAntennaRotate.value = withSpring(-15);
        rightAntennaRotate.value = withSpring(15);
        eyeScale.value = withSpring(1.1); // Eyes wide open
        mouthWidth.value = withTiming(25, { duration: 200 });
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 500 }),
            withTiming(0.3, { duration: 500 })
          ),
          -1,
          true
        );
        break;

      case 'thinking':
        leftAntennaRotate.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 400 }),
            withTiming(10, { duration: 400 })
          ),
          -1,
          true
        );
        rightAntennaRotate.value = withRepeat(
          withSequence(
            withTiming(10, { duration: 400 }),
            withTiming(-10, { duration: 400 })
          ),
          -1,
          true
        );
        eyeScale.value = withSpring(1);
        leftPupilX.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 600 }),
            withTiming(3, { duration: 600 })
          ),
          -1,
          true
        );
        mouthWidth.value = withTiming(15, { duration: 200 }); // Smaller, contemplative
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 300 }),
            withTiming(0.3, { duration: 300 })
          ),
          -1,
          true
        );
        break;

      case 'speaking':
        leftAntennaRotate.value = withRepeat(
          withSequence(
            withSpring(-8),
            withSpring(8)
          ),
          -1,
          true
        );
        rightAntennaRotate.value = withRepeat(
          withSequence(
            withSpring(8),
            withSpring(-8)
          ),
          -1,
          true
        );
        eyeScale.value = withSpring(1);
        leftPupilX.value = withSpring(0);
        mouthWidth.value = withRepeat(
          withSequence(
            withTiming(30, { duration: 150 }),
            withTiming(20, { duration: 150 })
          ),
          -1,
          true
        );
        glowOpacity.value = withTiming(0.5, { duration: 200 });
        break;

      case 'looking':
        leftAntennaRotate.value = withSpring(-20);
        rightAntennaRotate.value = withSpring(20);
        eyeScale.value = withSpring(1.2); // Extra wide
        leftPupilX.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 800 }),
            withTiming(5, { duration: 800 })
          ),
          -1,
          true
        );
        mouthWidth.value = withTiming(22, { duration: 200 });
        glowOpacity.value = withTiming(0.6, { duration: 200 });
        break;
    }
  }, [state]);

  // Animated styles
  const leftAntennaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftAntennaRotate.value}deg` }],
  }));

  const rightAntennaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightAntennaRotate.value}deg` }],
  }));

  const leftEyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeScale.value }],
  }));

  const rightEyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeScale.value }],
  }));

  const leftPupilStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftPupilX.value }],
  }));

  const rightPupilStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftPupilX.value }],
  }));

  const mouthStyle = useAnimatedStyle(() => ({
    width: mouthWidth.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: COLORS[state],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bodyScale.value }],
  }));

  const stateColor = COLORS[state];

  return (
    <View style={styles.container}>
      {/* Glow ring */}
      <Animated.View style={[styles.glow, glowStyle, { backgroundColor: stateColor }]} />

      <Animated.View style={[styles.avatarBody, bodyStyle]}>
        {/* Antennas */}
        <View style={styles.antennasContainer}>
          <Animated.View style={[styles.antenna, styles.leftAntenna, leftAntennaStyle]}>
            <View style={[styles.antennaTip, { backgroundColor: stateColor }]} />
          </Animated.View>
          <Animated.View style={[styles.antenna, styles.rightAntenna, rightAntennaStyle]}>
            <View style={[styles.antennaTip, { backgroundColor: stateColor }]} />
          </Animated.View>
        </View>

        {/* Face */}
        <View style={styles.face}>
          {/* Eyes */}
          <View style={styles.eyesContainer}>
            <Animated.View style={[styles.eye, leftEyeStyle]}>
              <Animated.View style={[styles.pupil, leftPupilStyle]} />
            </Animated.View>
            <Animated.View style={[styles.eye, rightEyeStyle]}>
              <Animated.View style={[styles.pupil, rightPupilStyle]} />
            </Animated.View>
          </View>

          {/* Mouth */}
          <View style={styles.mouthContainer}>
            <Animated.View style={[styles.mouth, mouthStyle, { backgroundColor: stateColor }]} />
          </View>
        </View>

        {/* Body base */}
        <View style={styles.bodyBase}>
          <View style={[styles.bodyAccent, { backgroundColor: stateColor }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  avatarBody: {
    alignItems: 'center',
  },
  antennasContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: -5,
  },
  antenna: {
    width: 4,
    height: 30,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginHorizontal: 20,
  },
  leftAntenna: {
    transformOrigin: 'bottom',
  },
  rightAntenna: {
    transformOrigin: 'bottom',
  },
  antennaTip: {
    position: 'absolute',
    top: -6,
    left: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  face: {
    width: 140,
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eyesContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  eye: {
    width: 28,
    height: 28,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pupil: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  mouthContainer: {
    height: 10,
    justifyContent: 'center',
  },
  mouth: {
    height: 6,
    borderRadius: 3,
  },
  bodyBase: {
    width: 80,
    height: 30,
    backgroundColor: '#E2E8F0',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginTop: -5,
    alignItems: 'center',
    paddingTop: 8,
  },
  bodyAccent: {
    width: 40,
    height: 8,
    borderRadius: 4,
  },
});
