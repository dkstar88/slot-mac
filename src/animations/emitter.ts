import { Container, Texture, Ticker, Spritesheet, AnimatedSprite, Assets } from "pixi.js";


class _ParticleEmitter {

    public emitOut(
        animation: Texture[],
        centerX: number, centerY: number, 
        screen_width: number, 
        screen_height: number, 
        amount: number, ctx: Container): void {
           
       
        // // Create and emit particles
        for (let i = 0; i < amount; i++) {
    
          const particle = new AnimatedSprite(animation);
          
          // Set particle properties
          particle.anchor.set(0.5);
          particle.scale.set(0.5 + Math.random() * 0.5); // Random size
          particle.animationSpeed = 0.2 + Math.random() * 0.1; // Random animation speed
          particle.loop = true;
          
          // Set initial position (slightly randomized around center)
          particle.position.set(
            centerX + (Math.random() - 0.5) * 100,
            centerY + (Math.random() - 0.5) * 100
          );
          
          // Set random velocity
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 3;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed - 5; // Initial upward velocity
          
          // Add to container
          ctx.addChild(particle);
          
          // Start animation
          particle.play();
          
          // Create animation
          const startTime = Date.now();
          const duration = 1000 + Math.random() * 1000; // Random duration
          
          // Use PixiJS ticker for animation
          const animate = (_: Ticker) => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = elapsed / duration;
            
            // Apply gravity
            particle.position.x += vx;
            particle.position.y += vy + progress * 10; // Increasing downward velocity
            
            // Spin the particle
            particle.rotation += 0.1;
            
            // If animation is complete or particle is off-screen, remove it
            if (progress >= 1 || 
                particle.position.y > screen_height + 50 ||
                particle.position.x < -50 ||
                particle.position.x > screen_width + 50) {
              Ticker.shared.remove(animate);
              ctx.removeChild(particle);
              particle.destroy();
            }
          };
          
          // Add to ticker
          Ticker.shared.add(animate);
        }
      }
}


export const ParticleEmitter = new _ParticleEmitter();