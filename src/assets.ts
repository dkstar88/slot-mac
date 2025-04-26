import { Assets } from 'pixi.js';
import { GLYPHS_ARRAY } from './core/glyphs';
import { sound } from '@pixi/sound';

export function loadAllAssets(): Promise<{ asset: { src: string; alias: string; }; texture: any; success: boolean; } | { asset: { src: string; alias: string; }; error: any; success: boolean; }>[]
{
    const glyphsAssets = GLYPHS_ARRAY.map(glyph => {
        return {
          src: `assets/symbols/${glyph.type}.png`,
          alias: glyph.type
        };
      });
    const soundsAssets = [
        {
            src: 'assets/sound/spin.mp3',
            alias: 'spin'
        },
        {
            src: 'assets/sound/payout1.mp3',
            alias: 'payout1'
        },
        {
            src: 'assets/sound/payout2.mp3',
            alias: 'payout2'
        },
        {
            src: 'assets/sound/payout3.mp3',
            alias: 'payout3'
        },
        {
            src: 'assets/sound/payout4.mp3',
            alias: 'payout4'
        },
        {
            src: 'assets/sound/jackpot.mp3',
            alias: 'jackpot'
        },
        {
            src: 'assets/sound/insert.mp3',
            alias: 'insert'
        },        
        {
            src: 'assets/sound/win.wav',
            alias: 'win'
        },            
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
        },
    ]
    
    const animationAssets = [
        {
            src: 'assets/animation/gold_anim.json',
            alias: 'goldAnim'
        }
    ];

    const allAssets = [...glyphsAssets,
        ...uiAssets,
        ...animationAssets
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

    soundsAssets.forEach(soundAsset => {
        sound.add(soundAsset.alias, soundAsset.src);        
    });

    return loadPromises;

}
