import { Assets } from 'pixi.js';
import { SYMBOLS_ARRAY } from './core/symbols';

export function loadAllAssets(): Promise<{ asset: { src: string; alias: string; }; texture: any; success: boolean; } | { asset: { src: string; alias: string; }; error: any; success: boolean; }>[]
{
    const symbolsAssets = SYMBOLS_ARRAY.map(symbol => {
        return {
          src: `assets/symbols/${symbol.type}.png`,
          alias: symbol.type
        };
      });
    const soundsAssets = [
        {
            src: 'assets/sounds/spin.mp3',
            alias: 'spin'
        },
        {
            src: 'assets/sounds/win.mp3',
            alias: 'win'
        },
        {
            src: 'assets/sounds/lose.mp3',
            alias: 'lose'
        },
        {
            src: 'assets/sounds/bonus.mp3',
            alias: 'bonus'
        },
        {
            src: 'assets/sounds/collect.mp3',
            alias: 'collect'
        },
        {
            src: 'assets/sounds/stop.mp3',
            alias: 'stop'
        }
    ];
    const uiAssets = [
        {
            src: 'assets/ui/slots.png',
            alias: 'slots'
        },
        {
            src: 'assets/ui/background.jpg',
            alias: 'background'
        },
        {
            src: 'assets/ui/reel.png',
            alias: 'reel'
        }
    ]
    
    const allAssets = [...symbolsAssets,
        ...soundsAssets, ...uiAssets
    ];

    const loadPromises = allAssets.map(asset => {
      return Assets.load(asset)
        .then(texture => {
          console.log(`Successfully loaded texture: ${asset.src}`);
          return { asset, texture, success: true };
        })
        .catch(error => {
          console.error(`Failed to load texture: ${asset.src}`, error);
          return { asset, error, success: false };
        });
    });
    return loadPromises;

}