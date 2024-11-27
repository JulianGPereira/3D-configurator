declare namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        cameraControls?: boolean;
        interpolationDecay?: string;
        skyboxImage?: string;
        skyboxHeight?: string;
        maxCameraOrbit?: string;
        exposure?: string
        style?: React.CSSProperties;
        // Any other attributes you may need
      };
      'effect-composer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        renderMode?: 'quality' | 'performance';
        // Any other attributes for effect-composer
      };
      'selective-bloom-effect': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        strength?: number;
        radius?: number | string;
        threshold?: number | string;
      };
      'outline-effect': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        color?: string;
        strength?: number;
      };
      'color-grade-effect': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        color?: string;
        strength?: number;
      };
      'smaa-effect': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        quality?: string;
       
      };
    }
  }
  