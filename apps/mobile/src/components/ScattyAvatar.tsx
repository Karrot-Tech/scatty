import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { ScattyState } from '@scatty/shared';
import { colors, getStateColor, getStateAccentColor } from '../theme';

interface Props {
  state: ScattyState;
}

export function ScattyAvatar({ state }: Props) {
  // Animation values
  const leftWingRotate = useSharedValue(0);
  const rightWingRotate = useSharedValue(0);
  const bodyFloat = useSharedValue(0);
  const eyeScale = useSharedValue(1);
  const blinkValue = useSharedValue(1);
  const pupilX = useSharedValue(0);
  const mouthScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);

  // Sparkle animations
  const sparkle1Opacity = useSharedValue(0);
  const sparkle1Y = useSharedValue(0);
  const sparkle2Opacity = useSharedValue(0);
  const sparkle2Y = useSharedValue(0);
  const sparkle3Opacity = useSharedValue(0);
  const sparkle3Y = useSharedValue(0);
  const sparkle4Opacity = useSharedValue(0);
  const sparkle4Y = useSharedValue(0);

  // Wing flutter animation
  const startWingFlutter = (speed: number = 150) => {
    leftWingRotate.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: speed, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: speed, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rightWingRotate.value = withRepeat(
      withSequence(
        withTiming(15, { duration: speed, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: speed, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  };

  // Sparkle animation
  const startSparkles = (intensity: number = 1) => {
    const duration = 2000 / intensity;

    sparkle1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: duration * 0.3 }),
        withTiming(0, { duration: duration * 0.7 })
      ),
      -1
    );
    sparkle1Y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: duration }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );

    sparkle2Opacity.value = withDelay(duration * 0.25, withRepeat(
      withSequence(
        withTiming(0.9, { duration: duration * 0.3 }),
        withTiming(0, { duration: duration * 0.7 })
      ),
      -1
    ));
    sparkle2Y.value = withDelay(duration * 0.25, withRepeat(
      withSequence(
        withTiming(-25, { duration: duration }),
        withTiming(0, { duration: 0 })
      ),
      -1
    ));

    sparkle3Opacity.value = withDelay(duration * 0.5, withRepeat(
      withSequence(
        withTiming(0.7, { duration: duration * 0.3 }),
        withTiming(0, { duration: duration * 0.7 })
      ),
      -1
    ));
    sparkle3Y.value = withDelay(duration * 0.5, withRepeat(
      withSequence(
        withTiming(-18, { duration: duration }),
        withTiming(0, { duration: 0 })
      ),
      -1
    ));

    sparkle4Opacity.value = withDelay(duration * 0.75, withRepeat(
      withSequence(
        withTiming(0.85, { duration: duration * 0.3 }),
        withTiming(0, { duration: duration * 0.7 })
      ),
      -1
    ));
    sparkle4Y.value = withDelay(duration * 0.75, withRepeat(
      withSequence(
        withTiming(-22, { duration: duration }),
        withTiming(0, { duration: 0 })
      ),
      -1
    ));
  };

  // Blink animation
  const startBlinking = () => {
    blinkValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500 }),
        withTiming(0.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      ),
      -1
    );
  };

  // Update animations based on state
  useEffect(() => {
    cancelAnimation(leftWingRotate);
    cancelAnimation(rightWingRotate);
    cancelAnimation(bodyFloat);
    cancelAnimation(pupilX);
    cancelAnimation(glowOpacity);
    cancelAnimation(glowScale);
    cancelAnimation(eyeScale);
    cancelAnimation(mouthScale);

    // Always have gentle floating
    bodyFloat.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    startBlinking();

    switch (state) {
      case 'idle':
        startWingFlutter(200); // Slow flutter
        startSparkles(0.5);
        eyeScale.value = withSpring(1);
        mouthScale.value = withSpring(1);
        pupilX.value = withSpring(0);
        glowOpacity.value = withTiming(0.2, { duration: 300 });
        glowScale.value = withTiming(1, { duration: 300 });
        break;

      case 'listening':
        startWingFlutter(120); // Faster flutter - attentive
        startSparkles(1.5);
        eyeScale.value = withSpring(1.15); // Wider eyes - curious
        mouthScale.value = withSpring(0.8); // Slightly smaller - focused
        pupilX.value = withSpring(0);
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 400 }),
            withTiming(0.25, { duration: 400 })
          ),
          -1,
          true
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 400 }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          true
        );
        break;

      case 'thinking':
        startWingFlutter(180);
        startSparkles(2);
        eyeScale.value = withSpring(1);
        mouthScale.value = withSpring(0.6); // Smaller - contemplative
        pupilX.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 800 }),
            withTiming(3, { duration: 800 })
          ),
          -1,
          true
        );
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: 300 }),
            withTiming(0.2, { duration: 300 })
          ),
          -1,
          true
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 300 }),
            withTiming(0.98, { duration: 300 })
          ),
          -1,
          true
        );
        break;

      case 'speaking':
        startWingFlutter(100); // Fast happy flutter
        startSparkles(2.5);
        eyeScale.value = withSpring(1.05);
        mouthScale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 150 }),
            withTiming(1, { duration: 150 })
          ),
          -1,
          true
        );
        pupilX.value = withSpring(0);
        glowOpacity.value = withTiming(0.45, { duration: 200 });
        glowScale.value = withTiming(1.02, { duration: 200 });
        break;

      case 'looking':
        startWingFlutter(90); // Very fast - excited
        startSparkles(3);
        eyeScale.value = withSpring(1.25); // Extra wide - amazed
        mouthScale.value = withSpring(1.1);
        pupilX.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 600 }),
            withTiming(4, { duration: 600 })
          ),
          -1,
          true
        );
        glowOpacity.value = withTiming(0.55, { duration: 200 });
        glowScale.value = withTiming(1.1, { duration: 200 });
        break;
    }
  }, [state]);

  // Animated styles
  const leftWingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${leftWingRotate.value}deg` },
    ],
  }));

  const rightWingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rightWingRotate.value}deg` },
    ],
  }));

  const bodyFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bodyFloat.value }],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: eyeScale.value },
      { scaleY: interpolate(eyeScale.value * blinkValue.value, [0, 1, 1.25], [0.1, 1, 1.25]) },
    ],
  }));

  const pupilStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pupilX.value }],
  }));

  const mouthStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: mouthScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1Opacity.value,
    transform: [{ translateY: sparkle1Y.value }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2Opacity.value,
    transform: [{ translateY: sparkle2Y.value }],
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    opacity: sparkle3Opacity.value,
    transform: [{ translateY: sparkle3Y.value }],
  }));

  const sparkle4Style = useAnimatedStyle(() => ({
    opacity: sparkle4Opacity.value,
    transform: [{ translateY: sparkle4Y.value }],
  }));

  const stateColor = getStateColor(state);
  const stateAccentColor = getStateAccentColor(state);

  return (
    <View style={styles.container}>
      {/* Glow aura */}
      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          { backgroundColor: stateColor }
        ]}
      />

      <Animated.View style={[styles.avatarBody, bodyFloatStyle]}>
        {/* Sparkles */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, sparkle1Style]}>
          <View style={[styles.sparkleInner, { backgroundColor: colors.fairy.sparkle }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle2, sparkle2Style]}>
          <View style={[styles.sparkleInner, styles.sparkleSmall, { backgroundColor: colors.fairy.sparkleAlt }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle3, sparkle3Style]}>
          <View style={[styles.sparkleInner, { backgroundColor: stateColor }]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle4, sparkle4Style]}>
          <View style={[styles.sparkleInner, styles.sparkleSmall, { backgroundColor: colors.fairy.sparkle }]} />
        </Animated.View>

        {/* Wings */}
        <View style={styles.wingsContainer}>
          <Animated.View style={[styles.wingLeft, leftWingStyle]}>
            <View style={[styles.wingInner, { backgroundColor: colors.fairy.wings }]}>
              <View style={[styles.wingPattern, { backgroundColor: stateColor }]} />
            </View>
          </Animated.View>
          <Animated.View style={[styles.wingRight, rightWingStyle]}>
            <View style={[styles.wingInner, { backgroundColor: colors.fairy.wings }]}>
              <View style={[styles.wingPattern, { backgroundColor: stateColor }]} />
            </View>
          </Animated.View>
        </View>

        {/* Hair buns */}
        <View style={styles.hairContainer}>
          <View style={[styles.hairBun, styles.hairBunLeft]}>
            <View style={[styles.hairBunInner, { backgroundColor: colors.fairy.hair }]} />
            <View style={[styles.hairHighlight, { backgroundColor: colors.fairy.hairHighlight }]} />
          </View>
          <View style={[styles.hairBun, styles.hairBunRight]}>
            <View style={[styles.hairBunInner, { backgroundColor: colors.fairy.hair }]} />
            <View style={[styles.hairHighlight, { backgroundColor: colors.fairy.hairHighlight }]} />
          </View>
        </View>

        {/* Face */}
        <View style={styles.face}>
          {/* Bangs */}
          <View style={styles.bangs}>
            <View style={[styles.bangPiece, styles.bangLeft, { backgroundColor: colors.fairy.hair }]} />
            <View style={[styles.bangPiece, styles.bangMiddle, { backgroundColor: colors.fairy.hair }]} />
            <View style={[styles.bangPiece, styles.bangRight, { backgroundColor: colors.fairy.hair }]} />
          </View>

          {/* Eyes */}
          <View style={styles.eyesContainer}>
            <Animated.View style={[styles.eye, eyeStyle]}>
              <View style={styles.eyeWhite}>
                <Animated.View style={[styles.pupil, pupilStyle]}>
                  <View style={styles.pupilHighlight} />
                </Animated.View>
              </View>
            </Animated.View>
            <Animated.View style={[styles.eye, eyeStyle]}>
              <View style={styles.eyeWhite}>
                <Animated.View style={[styles.pupil, pupilStyle]}>
                  <View style={styles.pupilHighlight} />
                </Animated.View>
              </View>
            </Animated.View>
          </View>

          {/* Blush */}
          <View style={styles.blushContainer}>
            <View style={[styles.blush, { backgroundColor: colors.fairy.blush }]} />
            <View style={[styles.blush, { backgroundColor: colors.fairy.blush }]} />
          </View>

          {/* Mouth */}
          <Animated.View style={[styles.mouthContainer, mouthStyle]}>
            <View style={[styles.mouth, { backgroundColor: colors.fairy.mouth }]} />
          </Animated.View>
        </View>

        {/* Body/Dress */}
        <View style={styles.body}>
          <View style={[styles.dress, { backgroundColor: colors.fairy.dress }]}>
            <View style={[styles.dressAccent, { backgroundColor: stateAccentColor }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  avatarBody: {
    alignItems: 'center',
  },
  // Sparkles
  sparkle: {
    position: 'absolute',
    zIndex: 10,
  },
  sparkle1: {
    top: 20,
    left: -50,
  },
  sparkle2: {
    top: 60,
    right: -45,
  },
  sparkle3: {
    top: 10,
    right: -30,
  },
  sparkle4: {
    top: 50,
    left: -35,
  },
  sparkleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  sparkleSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  // Wings
  wingsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    top: 55,
    width: 180,
    justifyContent: 'space-between',
  },
  wingLeft: {
    transformOrigin: 'right center',
  },
  wingRight: {
    transformOrigin: 'left center',
  },
  wingInner: {
    width: 35,
    height: 55,
    borderRadius: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  wingPattern: {
    width: 12,
    height: 20,
    borderRadius: 6,
    opacity: 0.4,
  },
  // Hair
  hairContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 110,
    marginBottom: -15,
    zIndex: 2,
  },
  hairBun: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairBunLeft: {},
  hairBunRight: {},
  hairBunInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  hairHighlight: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 5,
    left: 5,
    opacity: 0.6,
  },
  // Face
  face: {
    width: 100,
    height: 95,
    backgroundColor: colors.fairy.skin,
    borderRadius: 50,
    alignItems: 'center',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 1,
  },
  // Bangs
  bangs: {
    position: 'absolute',
    top: -5,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  bangPiece: {
    height: 25,
    borderRadius: 10,
  },
  bangLeft: {
    width: 25,
    marginRight: -5,
    transform: [{ rotate: '-10deg' }],
  },
  bangMiddle: {
    width: 30,
    height: 28,
  },
  bangRight: {
    width: 25,
    marginLeft: -5,
    transform: [{ rotate: '10deg' }],
  },
  // Eyes
  eyesContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  eye: {
    marginHorizontal: 8,
  },
  eyeWhite: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.fairy.eyes,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pupil: {
    width: 14,
    height: 14,
    backgroundColor: colors.fairy.eyes,
    borderRadius: 7,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 2,
    paddingLeft: 3,
  },
  pupilHighlight: {
    width: 5,
    height: 5,
    backgroundColor: colors.fairy.eyeHighlight,
    borderRadius: 2.5,
  },
  // Blush
  blushContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 80,
    marginTop: 2,
  },
  blush: {
    width: 18,
    height: 10,
    borderRadius: 5,
    opacity: 0.5,
  },
  // Mouth
  mouthContainer: {
    marginTop: 5,
  },
  mouth: {
    width: 12,
    height: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  // Body/Dress
  body: {
    marginTop: -8,
    zIndex: 0,
  },
  dress: {
    width: 60,
    height: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingTop: 12,
  },
  dressAccent: {
    width: 30,
    height: 6,
    borderRadius: 3,
  },
});
