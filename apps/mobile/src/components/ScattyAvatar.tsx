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
import { ScattyState, EmotionData, DEFAULT_EMOTION } from '@scatty/shared';
import { colors, getStateColor, getStateAccentColor } from '../theme';

interface Props {
  state: ScattyState;
  emotion?: EmotionData;
}

export function ScattyAvatar({ state, emotion = DEFAULT_EMOTION }: Props) {
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

  // Skirt petal animations
  const skirtPetal1Rotate = useSharedValue(0);
  const skirtPetal2Rotate = useSharedValue(0);
  const skirtPetal3Rotate = useSharedValue(0);
  const skirtPetal4Rotate = useSharedValue(0);
  const skirtPetal5Rotate = useSharedValue(0);

  // Arm animations
  const leftArmRotate = useSharedValue(25);
  const rightArmRotate = useSharedValue(-25);

  // Wing flutter animation
  // Wing flutter animation - More natural with scale and rotation
  const startWingFlutter = (speed: number = 150) => {
    // Left wing sequence
    leftWingRotate.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: speed, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: speed, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Right wing sequence (mirrored)
    rightWingRotate.value = withRepeat(
      withSequence(
        withTiming(20, { duration: speed, easing: Easing.inOut(Easing.sin) }),
        withTiming(-10, { duration: speed, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  };

  // Skirt flow animation - petals sway with different phases
  const startSkirtFlow = (intensity: number = 1) => {
    const baseDuration = 1200 / intensity;
    const swayAmount = 8 * intensity;

    // Each petal has a different phase for natural flowing effect
    skirtPetal1Rotate.value = withRepeat(
      withSequence(
        withTiming(-swayAmount, { duration: baseDuration, easing: Easing.inOut(Easing.ease) }),
        withTiming(swayAmount, { duration: baseDuration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    skirtPetal2Rotate.value = withDelay(baseDuration * 0.2, withRepeat(
      withSequence(
        withTiming(swayAmount * 0.8, { duration: baseDuration * 1.1, easing: Easing.inOut(Easing.ease) }),
        withTiming(-swayAmount * 0.8, { duration: baseDuration * 1.1, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));

    skirtPetal3Rotate.value = withDelay(baseDuration * 0.4, withRepeat(
      withSequence(
        withTiming(-swayAmount * 0.6, { duration: baseDuration * 0.9, easing: Easing.inOut(Easing.ease) }),
        withTiming(swayAmount * 0.6, { duration: baseDuration * 0.9, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));

    skirtPetal4Rotate.value = withDelay(baseDuration * 0.3, withRepeat(
      withSequence(
        withTiming(swayAmount * 0.7, { duration: baseDuration, easing: Easing.inOut(Easing.ease) }),
        withTiming(-swayAmount * 0.7, { duration: baseDuration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));

    skirtPetal5Rotate.value = withDelay(baseDuration * 0.5, withRepeat(
      withSequence(
        withTiming(-swayAmount * 0.9, { duration: baseDuration * 1.2, easing: Easing.inOut(Easing.ease) }),
        withTiming(swayAmount * 0.9, { duration: baseDuration * 1.2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
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
    cancelAnimation(leftArmRotate);
    cancelAnimation(rightArmRotate);

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
        startSkirtFlow(0.6); // Gentle sway
        eyeScale.value = withSpring(1);
        mouthScale.value = withSpring(1);
        pupilX.value = withSpring(0);
        glowOpacity.value = withTiming(0.2, { duration: 300 });
        glowScale.value = withTiming(1, { duration: 300 });
        // Idle breathing arms
        leftArmRotate.value = withRepeat(
          withSequence(
            withTiming(25, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(30, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ), -1, true
        );
        rightArmRotate.value = withRepeat(
          withSequence(
            withTiming(-25, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(-30, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ), -1, true
        );
        break;

      case 'listening':
        startWingFlutter(120); // Faster flutter - attentive
        startSparkles(1.5);
        startSkirtFlow(0.8); // Attentive sway
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
        // Alert arms
        leftArmRotate.value = withSpring(35);
        rightArmRotate.value = withSpring(-35); // Slight raise
        break;

      case 'thinking':
        startWingFlutter(180);
        startSparkles(2);
        startSkirtFlow(0.7); // Contemplative sway
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
        // Thinking pose - one arm up (scratching head/pondering)
        leftArmRotate.value = withSpring(20);
        rightArmRotate.value = withRepeat(
          withSequence(
            withTiming(-100, { duration: 1000 }), // Hand near face
            withTiming(-110, { duration: 1000 })
          ), -1, true
        );
        break;

      case 'speaking':
        startWingFlutter(100); // Fast happy flutter
        startSparkles(2.5);
        startSkirtFlow(1.2); // Animated flow
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
        // Active gestures - wand waving
        leftArmRotate.value = withRepeat(
          withSequence(
            withTiming(30, { duration: 500 }),
            withTiming(50, { duration: 500 })
          ), -1, true
        );
        rightArmRotate.value = withRepeat(
          withSequence(
            withTiming(-20, { duration: 400 }), // Waving magic wand
            withTiming(-60, { duration: 400 })
          ), -1, true
        );
        break;

      case 'looking':
        startWingFlutter(90); // Very fast - excited
        startSparkles(3);
        startSkirtFlow(1.5); // Excited flow
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
        glowOpacity.value = withTiming(0.6, { duration: 200 });
        glowScale.value = withTiming(1.1, { duration: 200 });
        // Excited / raising arms (cheering)
        leftArmRotate.value = withTiming(130, { duration: 400 }); // Arms up!
        rightArmRotate.value = withTiming(-130, { duration: 400 });
        break;
    }
  }, [state]);

  // Apply emotion-based adjustments
  useEffect(() => {
    if (!emotion) return;

    console.log('[Avatar] Applying emotion:', emotion.emotion, 'intensity:', emotion.intensity);

    // Apply eye size based on emotion
    const targetEyeSize = emotion.eyeSize ?? 1.0;
    eyeScale.value = withSpring(targetEyeSize, { damping: 12 });

    // Apply mouth based on emotion
    const targetMouth = 1 + (emotion.mouthOpen ?? 0) * 0.5;
    mouthScale.value = withSpring(targetMouth, { damping: 15 });

    // Apply wing speed based on emotion
    const wingSpeedMs = Math.max(80, 200 / (emotion.wingSpeed ?? 1.0));
    startWingFlutter(wingSpeedMs);

    // Apply sparkle intensity
    const sparkleLevel = emotion.sparkleIntensity ?? 1.0;
    startSparkles(sparkleLevel);

    // Apply glow based on intensity
    const glowLevel = 0.2 + (emotion.intensity * 0.4);
    glowOpacity.value = withTiming(glowLevel, { duration: 300 });

  }, [emotion]);

  // Animated styles
  const leftWingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${leftWingRotate.value}deg` },
      // Add subtle scale for 3D effect
      { scaleX: interpolate(leftWingRotate.value, [-20, 10], [0.8, 1]) },
    ],
  }));

  const rightWingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rightWingRotate.value}deg` },
      // Add subtle scale for 3D effect - note scaling works differently on mirrored right wing
      { scaleX: interpolate(rightWingRotate.value, [20, -10], [0.8, 1]) },
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

  // Skirt petal animated styles
  const skirtPetal1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${skirtPetal1Rotate.value}deg` }],
  }));

  const skirtPetal2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${skirtPetal2Rotate.value}deg` }],
  }));

  const skirtPetal3Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${skirtPetal3Rotate.value}deg` }],
  }));

  const skirtPetal4Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${skirtPetal4Rotate.value}deg` }],
  }));

  const skirtPetal5Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${skirtPetal5Rotate.value}deg` }],
  }));

  const leftArmStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftArmRotate.value}deg` }],
  }));

  const rightArmStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightArmRotate.value}deg` }],
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

        {/* Butterfly Wings */}
        <View style={styles.wingsContainer}>
          {/* Left Wing */}
          <Animated.View style={[styles.wingLeft, leftWingStyle]}>
            {/* Upper Wing */}
            <View style={[styles.wingUpper, { backgroundColor: colors.fairy.wings }]}>
              <View style={[styles.wingVein, styles.wingVein1, { backgroundColor: stateColor }]} />
              <View style={[styles.wingVein, styles.wingVein2, { backgroundColor: stateColor }]} />
              <View style={[styles.wingSpot, styles.spotLarge, { backgroundColor: stateColor }]} />
              <View style={[styles.wingSpot, styles.spotSmall, styles.spotTop, { backgroundColor: stateAccentColor }]} />
              <View style={[styles.wingEdge, { backgroundColor: stateAccentColor }]} />
            </View>
            {/* Lower Wing */}
            <View style={[styles.wingLower, { backgroundColor: colors.fairy.wings }]}>
              <View style={[styles.wingVein, styles.lowerVein, { backgroundColor: stateColor }]} />
              <View style={[styles.wingSpot, styles.spotMedium, { backgroundColor: stateColor }]} />
              <View style={[styles.wingLowerEdge, { backgroundColor: stateAccentColor }]} />
            </View>
          </Animated.View>

          {/* Right Wing */}
          <Animated.View style={[styles.wingRight, rightWingStyle]}>
            {/* Upper Wing */}
            <View style={[styles.wingUpper, styles.wingUpperRight, { backgroundColor: colors.fairy.wings }]}>
              <View style={[styles.wingVein, styles.wingVein1Right, { backgroundColor: stateColor }]} />
              <View style={[styles.wingVein, styles.wingVein2Right, { backgroundColor: stateColor }]} />
              <View style={[styles.wingSpot, styles.spotLarge, styles.spotRight, { backgroundColor: stateColor }]} />
              <View style={[styles.wingSpot, styles.spotSmall, styles.spotTopRight, { backgroundColor: stateAccentColor }]} />
              <View style={[styles.wingEdge, styles.wingEdgeRight, { backgroundColor: stateAccentColor }]} />
            </View>
            {/* Lower Wing */}
            <View style={[styles.wingLower, styles.wingLowerRight, { backgroundColor: colors.fairy.wings }]}>
              <View style={[styles.wingVein, styles.lowerVeinRight, { backgroundColor: stateColor }]} />
              <View style={[styles.wingSpot, styles.spotMedium, styles.spotMediumRight, { backgroundColor: stateColor }]} />
              <View style={[styles.wingLowerEdge, styles.wingLowerEdgeRight, { backgroundColor: stateAccentColor }]} />
            </View>
          </Animated.View>
        </View>

        {/* Hair buns */}
        <View style={styles.hairContainer}>
          <View style={[styles.hairBun, styles.hairBunLeft]}>
            <View style={[styles.hairBunInner, { backgroundColor: colors.fairy.hair }]}>
              <View style={[styles.hairShadow, { backgroundColor: colors.fairy.hairShadow }]} />
            </View>
            <View style={[styles.hairHighlight, { backgroundColor: colors.fairy.hairHighlight }]} />
          </View>
          <View style={[styles.hairBun, styles.hairBunRight]}>
            <View style={[styles.hairBunInner, { backgroundColor: colors.fairy.hair }]}>
              <View style={[styles.hairShadow, { backgroundColor: colors.fairy.hairShadow }]} />
            </View>
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

          {/* Eyebrows */}
          <View style={styles.eyebrowsContainer}>
            <View style={[styles.eyebrow, styles.eyebrowLeft, { backgroundColor: colors.fairy.eyebrow }]} />
            <View style={[styles.eyebrow, styles.eyebrowRight, { backgroundColor: colors.fairy.eyebrow }]} />
          </View>

          {/* Eyes */}
          <View style={styles.eyesContainer}>
            {/* Left Eye */}
            <Animated.View style={[styles.eye, eyeStyle]}>
              {/* Eyelashes */}
              <View style={styles.eyelashContainer}>
                <View style={[styles.eyelash, styles.lash1, { backgroundColor: colors.fairy.eyelash }]} />
                <View style={[styles.eyelash, styles.lash2, { backgroundColor: colors.fairy.eyelash }]} />
                <View style={[styles.eyelash, styles.lash3, { backgroundColor: colors.fairy.eyelash }]} />
              </View>
              <View style={styles.eyeWhite}>
                <View style={[styles.eyeShine, { backgroundColor: colors.fairy.eyeShine }]} />
                <Animated.View style={[styles.pupil, pupilStyle]}>
                  <View style={styles.pupilShade} />
                  <View style={styles.pupilHighlight} />
                  <View style={styles.pupilHighlight2} />
                </Animated.View>
              </View>
            </Animated.View>

            {/* Right Eye */}
            <Animated.View style={[styles.eye, eyeStyle]}>
              {/* Eyelashes */}
              <View style={styles.eyelashContainer}>
                <View style={[styles.eyelash, styles.lash1, { backgroundColor: colors.fairy.eyelash }]} />
                <View style={[styles.eyelash, styles.lash2, { backgroundColor: colors.fairy.eyelash }]} />
                <View style={[styles.eyelash, styles.lash3, { backgroundColor: colors.fairy.eyelash }]} />
              </View>
              <View style={styles.eyeWhite}>
                <View style={[styles.eyeShine, { backgroundColor: colors.fairy.eyeShine }]} />
                <Animated.View style={[styles.pupil, pupilStyle]}>
                  <View style={styles.pupilShade} />
                  <View style={styles.pupilHighlight} />
                  <View style={styles.pupilHighlight2} />
                </Animated.View>
              </View>
            </Animated.View>
          </View>

          {/* Nose (subtle) */}
          <View style={[styles.nose, { backgroundColor: colors.fairy.nose }]} />

          {/* Blush */}
          <View style={styles.blushContainer}>
            <View style={[styles.blush, { backgroundColor: colors.fairy.blush }]} />
            <View style={[styles.blush, { backgroundColor: colors.fairy.blush }]} />
          </View>

          {/* Mouth */}
          <Animated.View style={[styles.mouthContainer, mouthStyle]}>
            <View style={[styles.mouth, { backgroundColor: colors.fairy.mouth }]}>
              <View style={[styles.mouthHighlight, { backgroundColor: colors.fairy.mouthHighlight }]} />
            </View>
          </Animated.View>
        </View>

        {/* Neck */}
        <View style={[styles.neck, { backgroundColor: colors.fairy.skin }]}>
          <View style={[styles.neckShadow, { backgroundColor: colors.fairy.skinShadow }]} />
        </View>

        {/* Body/Dress with Flowing Skirt */}
        <View style={styles.body}>
          {/* Arms */}
          <Animated.View style={[styles.arm, styles.armLeft, leftArmStyle, { backgroundColor: colors.fairy.skin }]}>
            <View style={[styles.hand, { backgroundColor: colors.fairy.skin }]} />
          </Animated.View>
          <Animated.View style={[styles.arm, styles.armRight, rightArmStyle, { backgroundColor: colors.fairy.skin }]}>
            <View style={[styles.hand, { backgroundColor: colors.fairy.skin }]}>
              {/* Magic Wand */}
              <View style={styles.wandContainer}>
                <View style={styles.wandStick} />
                <View style={styles.wandStar} />
                <View style={[styles.wandStarInner, { transform: [{ rotate: '45deg' }] }]} />
              </View>
            </View>
          </Animated.View>

          <View style={[styles.dressTop, { backgroundColor: colors.fairy.dress }]}>
            <View style={[styles.dressAccent, { backgroundColor: stateAccentColor }]} />
          </View>

          {/* Animated Fairy Skirt Petals */}
          <View style={styles.skirtContainer}>
            <Animated.View style={[styles.skirtPetal, styles.skirtPetal1, skirtPetal1Style]}>
              <View style={[styles.petalInner, { backgroundColor: colors.fairy.dress }]}>
                <View style={styles.petalFrill} />
                <View style={[styles.petalHighlight, { backgroundColor: stateColor }]} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.skirtPetal, styles.skirtPetal2, skirtPetal2Style]}>
              <View style={[styles.petalInner, { backgroundColor: colors.fairy.dress }]}>
                <View style={styles.petalFrill} />
                <View style={[styles.petalHighlight, { backgroundColor: stateColor }]} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.skirtPetal, styles.skirtPetal3, skirtPetal3Style]}>
              <View style={[styles.petalInner, styles.petalLarge, { backgroundColor: colors.fairy.dress }]}>
                <View style={styles.petalFrill} />
                <View style={[styles.petalHighlight, { backgroundColor: stateColor }]} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.skirtPetal, styles.skirtPetal4, skirtPetal4Style]}>
              <View style={[styles.petalInner, { backgroundColor: colors.fairy.dress }]}>
                <View style={styles.petalFrill} />
                <View style={[styles.petalHighlight, { backgroundColor: stateColor }]} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.skirtPetal, styles.skirtPetal5, skirtPetal5Style]}>
              <View style={[styles.petalInner, { backgroundColor: colors.fairy.dress }]}>
                <View style={styles.petalFrill} />
                <View style={[styles.petalHighlight, { backgroundColor: stateColor }]} />
              </View>
            </Animated.View>
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
    height: 340,  // Increased from 240
  },
  glow: {
    position: 'absolute',
    width: 280,   // Increased from 200
    height: 280,
    borderRadius: 140,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
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
    top: 75,
    width: 130, // Increased slightly to show more wing
    justifyContent: 'space-between',
    zIndex: -1,
  },
  wingLeft: {
    transformOrigin: 'right center',
  },
  wingRight: {
    transformOrigin: 'left center',
  },
  wingUpper: {
    width: 60,
    height: 90,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 60,
    opacity: 0.85,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    transform: [{ rotate: '-10deg' }],
  },
  wingUpperRight: {
    transform: [{ rotate: '10deg' }, { scaleX: -1 }],
  },
  wingLower: {
    position: 'absolute',
    bottom: -40,
    left: 10,
    width: 45,
    height: 60,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 45,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    opacity: 0.85,
    overflow: 'hidden',
    transform: [{ rotate: '-20deg' }],
    zIndex: -1,
  },
  wingLowerRight: {
    left: 5,
    transform: [{ rotate: '20deg' }, { scaleX: -1 }],
  },
  // Wing Details
  wingVein: {
    position: 'absolute',
    height: 1,
    opacity: 0.4,
    borderRadius: 1,
  },
  wingVein1: {
    width: 70,
    top: 30,
    left: -10,
    transform: [{ rotate: '30deg' }],
  },
  wingVein1Right: {
    width: 70,
    top: 30,
    left: -10,
    transform: [{ rotate: '30deg' }],
  },
  wingVein2: {
    width: 60,
    top: 50,
    left: -5,
    transform: [{ rotate: '15deg' }],
  },
  wingVein2Right: {
    width: 60,
    top: 50,
    left: -5,
    transform: [{ rotate: '15deg' }],
  },
  lowerVein: {
    width: 50,
    top: 25,
    left: -5,
    transform: [{ rotate: '45deg' }],
  },
  lowerVeinRight: {
    width: 50,
    top: 25,
    left: -5,
    transform: [{ rotate: '45deg' }],
  },
  wingSpot: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.9,
  },
  spotLarge: {
    width: 14,
    height: 14,
    top: 15,
    right: 15,
  },
  spotMedium: {
    width: 10,
    height: 10,
    bottom: 15,
    right: 12,
  },
  spotMediumRight: {
    right: 12, // Since we scaleX: -1, relative positions flip naturally
  },
  spotSmall: {
    width: 6,
    height: 6,
  },
  spotTop: {
    top: 8,
    right: 35,
  },
  spotTopRight: {
    top: 8,
    right: 35,
  },
  spotRight: {
    right: 15,
  },
  wingEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 90,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopLeftRadius: 60,
    opacity: 0.5,
  },
  wingEdgeRight: {
    borderTopLeftRadius: 60,
  },
  wingLowerEdge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 45,
    height: 60,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomRightRadius: 45,
    opacity: 0.5,
  },
  wingLowerEdgeRight: {
    borderBottomRightRadius: 45,
  },
  // Hair
  hairContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
    marginBottom: -18,
    zIndex: 2,
  },
  hairBun: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairBunLeft: {},
  hairBunRight: {},
  hairBunInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  hairHighlight: {
    position: 'absolute',
    width: 20,
    height: 12,
    borderRadius: 10,
    top: 6,
    left: 8,
    opacity: 0.5,
    transform: [{ rotate: '-30deg' }],
  },
  hairShadow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    bottom: -10,
    right: -10,
    opacity: 0.3,
  },
  // Face
  face: {
    width: 130,
    height: 120,
    backgroundColor: colors.fairy.skin,
    borderRadius: 65,
    alignItems: 'center',
    paddingTop: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.fairy.eyes,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  eyeShine: {
    position: 'absolute',
    width: 20,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    top: 2,
  },
  pupil: {
    width: 20,
    height: 20,
    backgroundColor: colors.fairy.eyes,
    borderRadius: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 3,
    paddingLeft: 4,
  },
  pupilHighlight: {
    width: 6,
    height: 6,
    backgroundColor: colors.fairy.eyeHighlight,
    borderRadius: 3,
  },
  pupilHighlight2: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 1.5,
    bottom: 3,
    right: 3,
  },
  pupilShade: {
    position: 'absolute',
    width: 20,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    bottom: 0,
    left: 0,
  },
  // Eyebrows
  eyebrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 90,
    marginTop: 10,
    marginBottom: -4,
  },
  eyebrow: {
    width: 18,
    height: 4,
    borderRadius: 2,
  },
  eyebrowLeft: {
    transform: [{ rotate: '-8deg' }],
  },
  eyebrowRight: {
    transform: [{ rotate: '8deg' }],
  },
  // Eyelashes
  eyelashContainer: {
    position: 'absolute',
    top: -4,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1,
  },
  eyelash: {
    width: 2,
    height: 6,
    borderRadius: 1,
    marginHorizontal: 1.5,
  },
  lash1: {
    transform: [{ rotate: '-15deg' }],
  },
  lash2: {
    height: 8,
  },
  lash3: {
    transform: [{ rotate: '15deg' }],
  },
  // Nose
  nose: {
    width: 6,
    height: 4,
    borderRadius: 3,
    opacity: 0.4,
    marginTop: 2,
  },
  // Blush
  blushContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 82,
    marginTop: 3,
  },
  blush: {
    width: 20,
    height: 12,
    borderRadius: 6,
    opacity: 0.45,
  },
  // Mouth
  mouthContainer: {
    marginTop: 4,
  },
  mouth: {
    width: 14,
    height: 8,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    alignItems: 'center',
    overflow: 'hidden',
  },
  mouthHighlight: {
    width: 8,
    height: 3,
    borderRadius: 1.5,
    marginTop: 1,
    opacity: 0.6,
  },
  // Body/Dress
  // Body/Dress
  body: {
    marginTop: -8,
    zIndex: 0,
    alignItems: 'center',
  },
  // Neck
  neck: {
    width: 24,
    height: 15,
    borderRadius: 12,
    position: 'absolute',
    top: 110,
    zIndex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neckShadow: {
    width: 24,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    opacity: 0.3,
  },
  // Arms
  arm: {
    position: 'absolute',
    width: 14,
    height: 35,
    borderRadius: 7,
    top: 2,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    transformOrigin: 'top center',
  },
  armLeft: {
    left: -12,
  },
  armRight: {
    right: -12,
  },
  hand: {
    position: 'absolute',
    bottom: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    left: -1,
  },
  // Magic Wand
  wandContainer: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    transform: [{ rotate: '-15deg' }],
    alignItems: 'center',
  },
  wandStick: {
    width: 4,
    height: 35,
    backgroundColor: '#D4AF37', // Gold
    borderRadius: 2,
  },
  wandStar: {
    width: 14,
    height: 14,
    backgroundColor: '#FFE566', // Sparkle color
    borderRadius: 3,
    position: 'absolute',
    top: -8,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#FFE566',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  wandStarInner: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#FFE566',
    borderRadius: 3,
    top: -8,
    transform: [{ rotate: '0deg' }], // Creates star shape combined with outer
  },
  dressTop: {
    width: 80,
    height: 35,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    paddingTop: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dressAccent: {
    width: 40,
    height: 6,
    borderRadius: 3,
  },
  // Animated Fairy Skirt
  skirtContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: -8,
    height: 70,
  },
  skirtPetal: {
    position: 'absolute',
    opacity: 0.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  skirtPetal1: {
    left: -32,
    transformOrigin: 'top center',
    transform: [{ rotate: '15deg' }],
  },
  skirtPetal2: {
    left: -16,
    transformOrigin: 'top center',
    transform: [{ rotate: '5deg' }],
  },
  skirtPetal3: {
    transformOrigin: 'top center',
    zIndex: 2,
  },
  skirtPetal4: {
    right: -16,
    transformOrigin: 'top center',
    transform: [{ rotate: '-5deg' }],
  },
  skirtPetal5: {
    right: -32,
    transformOrigin: 'top center',
    transform: [{ rotate: '-15deg' }],
  },
  petalInner: {
    width: 34,
    height: 60,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: '#E8D4F0', // Fallback
  },
  petalLarge: {
    width: 40,
    height: 65,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  petalHighlight: {
    width: 20,
    height: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 5,
  },
  // Frilly hem detail
  petalFrill: {
    position: 'absolute',
    bottom: -5,
    width: 40,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
