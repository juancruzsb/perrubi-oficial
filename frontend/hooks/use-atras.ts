// hooks/use-atras.ts
// Navegación "hacia atrás" de (tabs)/_layout.tsx, que es un navegador de Tabs
// con backBehavior="history". Ahí router.replace() se comporta como navigate()
// (los Tabs no tienen pila), así que el flujo de un paseo
//   crear-paseo -> buscando_paseador -> paseo_en_curso -> paseo_finalizado -> detalles_del_paseo
// queda ENTERO en el historial: router.back() desde el detalle volvía a
// paseo_finalizado / paseo_en_curso (que, al ver el paseo terminado, te
// redirigen de nuevo), y el botón físico de Android hacía lo mismo.
//
// Regla: las pantallas del flujo vuelven a donde estabas ANTES del flujo (una
// tab raíz) y, si el historial dice otra cosa (otra pantalla del flujo), a
// Inicio. Se aplica igual al botón de la pantalla y al botón físico de Android.
import { useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';

const INICIO = '/(tabs)';
const ORIGENES_VALIDOS = ['index', 'mis-paseos', 'perfil'];

type HistorialTabs = {
  routes: { key: string; name: string }[];
  history?: { type: string; key: string }[];
};

// Devuelve una función `volver` y registra el botón físico de Android para que
// haga lo mismo mientras la pantalla tiene el foco.
export function useAtrasDelFlujo(origenesValidos: string[] = ORIGENES_VALIDOS): () => void {
  const router = useRouter();
  const navigation = useNavigation();

  const volver = useCallback(() => {
    const state = navigation.getState() as unknown as HistorialTabs | undefined;
    const history = state?.history;
    const keyAnterior = history && history.length >= 2 ? history[history.length - 2].key : undefined;
    const anterior = state?.routes.find((r) => r.key === keyAnterior)?.name;

    if (anterior && origenesValidos.includes(anterior) && router.canGoBack()) {
      router.back();
    } else {
      router.navigate(INICIO);
    }
  }, [navigation, router, origenesValidos]);

  useBotonFisicoAtras(volver);
  return volver;
}

// Para las tabs raíz (Inicio, Mis paseos, Perfil): el botón físico de Android
// no debe caer en pantallas viejas del historial. Inicio sale de la app; las
// otras vuelven a Inicio. Tampoco devuelve nada: no hay botón en pantalla.
export function useAtrasEnTabRaiz(esInicio = false): void {
  const router = useRouter();

  const alAtras = useCallback(() => {
    if (esInicio) {
      if (Platform.OS === 'android') BackHandler.exitApp();
      return;
    }
    router.navigate(INICIO);
  }, [esInicio, router]);

  useBotonFisicoAtras(alAtras);
}

function useBotonFisicoAtras(alAtras: () => void): void {
  // useFocusEffect: las pantallas de Tabs no se desmontan, así que sin esto
  // el handler de una pantalla escondida pisaría el de la que está a la vista.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        alAtras();
        return true;
      });
      return () => sub.remove();
    }, [alAtras])
  );
}
