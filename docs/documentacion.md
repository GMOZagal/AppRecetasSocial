# Documentación del Proyecto: App Recetas Social (Arquitectura Avanzada)

Este documento detalla todas las implementaciones arquitectónicas, visuales y de rendimiento desarrolladas para cumplir con los requerimientos técnicos avanzados del sistema.

---

## 1. Arquitectura y Separación de Responsabilidades

El proyecto ha sido construido utilizando **React.js**, garantizando por diseño la modularidad y el empaquetado de responsabilidades. La estructura sugerida se ha traducido fielmente al estándar moderno del Virtual DOM de la siguiente manera:

*   **`api.js`** ➡️ Ubicado en `src/api/mockDataApi.js`. Contiene exclusivamente las funciones asíncronas puras (`fetchUsers`, `fetchPosts`, `fetchLatestPost`) que simulan el contacto con el backend.
*   **`cache.js`** ➡️ Implementado como caché en memoria dentro de `src/hooks/useCommunityData.js`, interceptando llamadas repetidas basándose en un temporizador de caducidad temporal (ej. 5 minutos).
*   **`dom.js / app.js`** ➡️ La orquestación del DOM está manejada nativamente por React en `src/App.jsx` y su árbol de componentes (UI modularizada).
*   **`animations.js`** ➡️ Centralizado en utilidades agnósticas (Hooks) como `src/hooks/useScrollAnimation.js` y `useMountTransition.js` que exponen comportamientos reactivos sin inyectar HTML explícito.
*   **`carousel.js`** ➡️ El código completo e independiente del slider táctil vive encapsulado en `src/components/HeroCarousel.jsx`.
*   **`animations.css`** ➡️ Todas las clases, utilidades y `@keyframes` se centralizaron estructuradamente en el archivo base `src/index.css`.

---

## 2. Implementación Asíncrona Avanzada

Se ha desarrollado un **Dashboard de Comunidad** (`CommunityDashboard.jsx`) capaz de manejar redes simuladas de alta carga:

*   **Simultaneidad:** Se utiliza `Promise.all([fetchUsers(), fetchPosts()])` para paralelizar peticiones bloqueadas y devolver los datos solo cuando todas las capas necesarias responden positivamente.
*   **Cancelación de Peticiones:** Se implementó nativamente la API de `AbortController` en el hook `useCommunityData`. Si un usuario cambia de pestaña velozmente o solicita una actualización mientras otra está en curso, la primera señal es abortada, previniendo fuga de datos (memory leaks) y errores de asincronía (race conditions).
*   **Manejo Visual de Errores:** La Mock API posee una aleatoriedad oculta que simula un fallo el 5% de las veces, lo cual es capturado en un bloque `try/catch` encendiendo un estado visual de error en el dashboard con opción de "Reintentar".

---

## 3. Patrones de Diseño: Observer (Pub/Sub)

Para cumplir explícitamente con las reglas de software, se retiró el *prop-drilling* vertical al comunicar estado y en su lugar se creó un canal de eventos independiente:

*   **El Canal:** Construimos `src/utils/eventBus.js`, un broker Vanilla JS puro desacoplado de React.
*   **Notificador (Publisher):** Banderas profundas pueden lanzar un aviso ejecutando `eventBus.publish('SHOW_TOAST', { message: 'Mensaje' })`.
*   **Oyente (Subscriber):** Un nodo general (`<GlobalToastProvider>`) inyectado en la raíz de la App "escucha" y reacciona de forma autónoma.

---

## 4. Animaciones, Transiciones y Micros UX

Se implementaron micro-interacciones (CSS/JS) enfocadas al dinamismo de la experiencia de usuario:

*   **Hover Animado y Efectos Magnéticos:** Los botones principales incorporan traslaciones en el eje Y (`scale`) acoplados con sombras. Los botones *Primary* están envueltos en un componente propio `MagneticButton.jsx` que atrapa un radio matemático y "arrastra" elegantemente el botón tras el cursor del usuario.
*   **Parallax Multicapa:** En `RecipeCard.jsx`, el tag `<img />` reacciona opuestamente al movimiento del ratón en tiempo real (`onMouseMove`) para generar profundidad a través de la propiedad CSS `transform: translate(x, y)`.
*   **Montajes Ocultos Suaves (No Display None):** Elementos dinámicos en los formularios o barras de filtros avanzados no cortan el DOM de tajo. Usan calculo CSS Grid (`grid-rows-0` a `grid-rows-1`) o un gancho JS que aguarda 300ms a que termine el `@keyframes fade-out` antes de desmontar el nodo en React.
*   **Animación al Bajar (Intersection Observer):** Las tarjetas de publicación se nutren de la clase `.animate-on-scroll`, detectando su proximidad al centro del viewport de forma escalonada con retardos aditivos progresivos calculados dinámicamente.

---

## 5. Carrusel Avanzado ("Desde Cero")

La "Landing Page" expone un modelo Carrusel fotográfico Premium que rechaza cualquier librería de terceros (como *Swiper* o *Slick*):

*   **Soporte Táctil:** El núcleo en ruta ` HeroCarousel.jsx` calcula la latencia del dedo en `onTouchStart/Move/End`, desplazando el cálculo geométrico manual usando su interpolador a ` translateX()`.
*   **Loop Infinito:** Al rebasar la barrera final, un algoritmo JS reposiciona el Viewport a la clonación artificial inicial de forma silente interrumpiendo un solo fotograma de la transición CSS, dando un "efecto Noria" permanente.
*   **Autoplay Reactivo:** Ciclos automáticos cada 5000ms que, al detectar proximidad del puntero o el toque del usuario, pausan el temporizador para otorgarle lectura cómoda.

---

## 6. Rendimiento y Optimización Científica

Se atacaron los cuellos de botella mediante metodologías obligatorias documentadas internamente:

1.  **Lazy Loading:** Reducción sistemática de peso. Todo asset HTML imagen posee nativamente el atributo de renderización diferido `loading="lazy"`.
2.  **Debounce:** Aislando la barra de texto "Buscar", forzamos nativamente a que nuestra redención visual y filtros solo corran tras una sequía del usuario digitador (`debounce.js >> 500ms`).
3.  **Throttle:** Abstracción generada puramente funcional para atrapar futuras iteraciones de saturación visual o Scroll de ventana paralela.
4.  **Minimización de Reflows (`requestAnimationFrame`):** Durante el roce táctil de Slider de la página inicial, enviar modificaciones visuales directamente generaba "GPU Layout Thrash". Toda inyección de posicionamiento ahora descansa en los cimientos del marco de refresco del monitor subyacente de la API `requestAnimationFrame`.
5.  **Benchmarking (`console.time`):** Herramienta explícita rodeando llamadas complejas como las resoluciones masivas del *Promise.all* para poder consultar desde terminal la eficiencia del algoritmo.

---

## 7. Reto Final: Actualizaciones en Tiempo Real (RT)

En pro a los principios de Optimización y Rendimiento, se seleccionó una arquitectura "Pull Data": **Polling Inteligente.**

*   El usuario se "engancha" a la red gracias al hook personalizado puro `usePolling`.
*   **Control de Frecuencia Ahorrativo:** Interrumpe todo tráfico consumista si la plataforma del usuario abandona la página actual o oculta la pestaña a través del escaneo del `document.visibilityState`.
*   **Fusión Atómica y Prevención:** El hilo intercepta la señal, valida por Hash de Identidad (ID) y rechaza duplicación de recetas antes de enviarlo a la cascada reactiva frontal.
*   **Puliendo los Sentidos:** En un empalme limpio con el **Patrón Observador** superior, "brinca" una alerta Toast y la nueva información de tarjeta de inyecta elegantemente al Layout aplicando una transición de inserción directa desde CSS (`@keyframes dropIn`).
