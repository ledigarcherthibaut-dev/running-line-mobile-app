import { useRef, useState } from 'react';
import { Animated, Keyboard, PanResponder } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

/** Seuil de bascule vers l'état réduit — 40% du parcours de la poignée, sinon la vitesse du geste tranche. */
const COLLAPSE_RATIO = 0.4;
const FLICK_VELOCITY = 0.8;

/**
 * Volet ancré en bas, glissable entre un état ouvert et un état réduit (poignée + contenu
 * compact) — logique partagée entre GenerateScreen et GenerateResultsScreen. Extrait de
 * GenerateScreen : `PanResponder.create()` n'est appelé qu'une fois (useRef), donc ses callbacks
 * referment sur les valeurs de `collapsed`/`maxTranslate` du tout premier rendu et ne voient
 * jamais leurs mises à jour — d'où la lecture via des refs tenues à jour à chaque rendu plutôt
 * que par closure. La position de départ du geste est capturée en interrompant l'animation en
 * cours (pas supposée depuis l'état), et overshootClamping évite tout dépassement au relâché.
 */
export function useBottomSheet({ panelHeight, peekHeight }: { panelHeight: number; peekHeight: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const reducedMotion = useReducedMotion();
  const maxTranslate = Math.max(panelHeight - peekHeight, 0);

  const translateY = useRef(new Animated.Value(0)).current;
  const dragStartRef = useRef(0);
  const collapsedRef = useRef(collapsed);
  collapsedRef.current = collapsed;
  const maxTranslateRef = useRef(maxTranslate);
  maxTranslateRef.current = maxTranslate;

  function snapTo(toCollapsed: boolean) {
    setCollapsed(toCollapsed);
    if (toCollapsed) Keyboard.dismiss();
    const toValue = toCollapsed ? maxTranslateRef.current : 0;
    if (reducedMotion) {
      translateY.setValue(toValue);
      return;
    }
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
      overshootClamping: true,
    }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateY.stopAnimation((value) => {
          dragStartRef.current = value;
        });
      },
      onPanResponderMove: (_e, g) => {
        const next = Math.min(Math.max(dragStartRef.current + g.dy, 0), maxTranslateRef.current);
        translateY.setValue(next);
      },
      onPanResponderRelease: (_e, g) => {
        const isTap = Math.abs(g.dy) < 6 && Math.abs(g.dx) < 6;
        if (isTap) {
          snapTo(!collapsedRef.current);
          return;
        }
        const current = dragStartRef.current + g.dy;
        const shouldCollapse = current > maxTranslateRef.current * COLLAPSE_RATIO || g.vy > FLICK_VELOCITY;
        snapTo(shouldCollapse);
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ).current;

  return { collapsed, translateY, panHandlers: panResponder.panHandlers, snapTo };
}
