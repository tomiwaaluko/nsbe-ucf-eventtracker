declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  interface GlobalOptions {
    resize?: boolean;
    useWorker?: boolean;
  }

  function confetti(options?: Options): Promise<null>;
  function confetti(options?: Options & { reset?: boolean }): Promise<null>;

  namespace confetti {
    function reset(): void;
    function create(
      canvas: HTMLCanvasElement,
      options?: GlobalOptions
    ): typeof confetti;
  }

  export = confetti;
}
