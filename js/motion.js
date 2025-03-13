/**
 * A simplified Framer Motion-like animation system for Chrome Extensions
 * This provides basic animation capabilities without requiring the full Framer Motion library
 */

window.motion = (function() {
  // Default easings
  const easings = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };

  /**
   * Animate a DOM element with specified properties and options
   * @param {HTMLElement} element - The element to animate
   * @param {Object} properties - The properties to animate
   * @param {Object} options - Animation options
   * @returns {Object} - Animation control object
   */
  function animate(element, properties, options = {}) {
    const defaults = {
      duration: 0.3,
      delay: 0,
      easing: 'easeOut',
      onUpdate: null,
      onComplete: null
    };

    const config = { ...defaults, ...options };
    const easing = typeof config.easing === 'function' ? config.easing : easings[config.easing];
    const startTime = performance.now() + config.delay * 1000;
    const endTime = startTime + config.duration * 1000;
    let animationFrame;
    let completed = false;

    // Store initial values
    const initialValues = {};
    const targetValues = {};
    
    // Process properties and extract arrays or single values
    for (const [key, value] of Object.entries(properties)) {
      if (Array.isArray(value)) {
        initialValues[key] = value[0];
        targetValues[key] = value[value.length - 1];
      } else {
        // If it's not an array, we assume the current value as initial
        initialValues[key] = getCurrentValue(element, key);
        targetValues[key] = value;
      }
    }

    /**
     * Get the current computed value of a property
     * @param {HTMLElement} el - The element
     * @param {string} prop - The property name
     * @returns {number} - The computed value
     */
    function getCurrentValue(el, prop) {
      // Get the computed style
      const style = window.getComputedStyle(el);
      
      // Check transform properties
      if (prop === 'x' || prop === 'y' || prop === 'scale' || prop === 'rotate') {
        const transform = style.transform;
        if (transform === 'none') {
          return prop === 'scale' ? 1 : 0;
        }
        
        // Parse the transform matrix
        const matrix = new DOMMatrix(transform);
        if (prop === 'x') return matrix.e;
        if (prop === 'y') return matrix.f;
        if (prop === 'scale') {
          // Approximate scale from the matrix
          return (matrix.a + matrix.d) / 2;
        }
        if (prop === 'rotate') {
          // Extract rotation in degrees
          return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        }
      }
      
      // Handle opacity
      if (prop === 'opacity') {
        return parseFloat(style.opacity);
      }
      
      // For other properties, return 0 as default
      return 0;
    }

    /**
     * Apply updated values to the element
     * @param {Object} values - The values to apply
     */
    function applyValues(values) {
      // Check for transform properties
      const transforms = [];
      let hasTransform = false;
      
      if ('x' in values) {
        transforms.push(`translateX(${values.x}px)`);
        hasTransform = true;
      }
      
      if ('y' in values) {
        transforms.push(`translateY(${values.y}px)`);
        hasTransform = true;
      }
      
      if ('scale' in values) {
        transforms.push(`scale(${values.scale})`);
        hasTransform = true;
      }
      
      if ('rotate' in values) {
        transforms.push(`rotate(${values.rotate}deg)`);
        hasTransform = true;
      }
      
      // Apply transform if any transform properties exist
      if (hasTransform) {
        element.style.transform = transforms.join(' ');
      }
      
      // Apply opacity directly
      if ('opacity' in values) {
        element.style.opacity = values.opacity;
      }
      
      // Apply other properties (height, width, etc.)
      for (const [key, value] of Object.entries(values)) {
        if (!['x', 'y', 'scale', 'rotate', 'opacity'].includes(key)) {
          // For numerical properties, add 'px' if needed
          if (typeof value === 'number') {
            element.style[key] = `${value}px`;
          } else {
            element.style[key] = value;
          }
        }
      }
    }

    /**
     * Animation frame loop
     */
    function update() {
      const now = performance.now();
      
      // If before start time, wait
      if (now < startTime) {
        animationFrame = requestAnimationFrame(update);
        return;
      }
      
      // If animation completed
      if (now >= endTime) {
        applyValues(targetValues);
        
        if (config.onComplete && !completed) {
          config.onComplete();
        }
        
        completed = true;
        return;
      }
      
      // Calculate progress
      const progress = (now - startTime) / (endTime - startTime);
      const easedProgress = easing(progress);
      
      // Interpolate values
      const currentValues = {};
      for (const prop in initialValues) {
        const start = initialValues[prop];
        const end = targetValues[prop];
        currentValues[prop] = start + (end - start) * easedProgress;
      }
      
      // Apply the interpolated values
      applyValues(currentValues);
      
      // Call onUpdate if provided
      if (config.onUpdate) {
        config.onUpdate(currentValues);
      }
      
      // Continue animation
      animationFrame = requestAnimationFrame(update);
    }

    // Start animation
    animationFrame = requestAnimationFrame(update);

    // Return control object
    return {
      stop() {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      },
      finished: new Promise(resolve => {
        const checkFinished = () => {
          if (completed) {
            resolve();
          } else {
            requestAnimationFrame(checkFinished);
          }
        };
        checkFinished();
      })
    };
  }

  // Return the public API
  return {
    animate
  };
})(); 