import { Container, Ticker, Spritesheet, AnimatedSprite, Assets } from "pixi.js";

/**
   * Emit gold coins based on payout amount
   * @param amount Number of coins to emit
   */
export function emitGoldCoins(centerX: number, centerY: number, 
    screen_width: number, 
    screen_height: number, 
    amount: number, ctx: Container): void {
    const goldCoinSpritesheet = Assets.get('goldAnim') as Spritesheet;
    
    // Calculate number of coins to emit (cap at a reasonable maximum)
    const numCoins = Math.min(amount, 50);
    
    // // Create and emit coins
    for (let i = 0; i < numCoins; i++) {

      const coin = new AnimatedSprite(goldCoinSpritesheet.animations["rotating_coin"]);
      
      // Set coin properties
      coin.anchor.set(0.5);
      coin.scale.set(0.5 + Math.random() * 0.5); // Random size
      coin.animationSpeed = 0.2 + Math.random() * 0.1; // Random animation speed
      coin.loop = true;
      
      // Set initial position (slightly randomized around center)
      coin.position.set(
        centerX + (Math.random() - 0.5) * 100,
        centerY + (Math.random() - 0.5) * 100
      );
      
      // Set random velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 5; // Initial upward velocity
      
      // Add to container
      ctx.addChild(coin);
      
      // Start animation
      coin.play();
      
      // Create animation
      const startTime = Date.now();
      const duration = 1000 + Math.random() * 1000; // Random duration
      
      // Use PixiJS ticker for animation
      const animate = (_: Ticker) => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        
        // Apply gravity
        coin.position.x += vx;
        coin.position.y += vy + progress * 10; // Increasing downward velocity
        
        // Spin the coin
        coin.rotation += 0.1;
        
        // If animation is complete or coin is off-screen, remove it
        if (progress >= 1 || 
            coin.position.y > screen_height + 50 ||
            coin.position.x < -50 ||
            coin.position.x > screen_width + 50) {
          Ticker.shared.remove(animate);
          ctx.removeChild(coin);
          coin.destroy();
        }
      };
      
      // Add to ticker
      Ticker.shared.add(animate);
    }
  }
  