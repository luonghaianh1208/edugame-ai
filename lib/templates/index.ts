// Central export for all 8 game templates
import { GameQuestion, GameSettings, TemplateId } from './types';
import { treasureHuntTemplate } from './treasure-hunt';
import { tugOfWarTemplate } from './tug-of-war';
import { territoryTemplate } from './territory';
import { bombDefuseTemplate } from './bomb-defuse';
import { mountainClimbTemplate } from './mountain-climb';
import { mosaicRevealTemplate } from './mosaic-reveal';
import { wheelFortuneTemplate } from './wheel-fortune';
import { rpgBattleTemplate } from './rpg-battle';

export function buildGameHtml(
  templateId: TemplateId,
  questions: GameQuestion[],
  settings: GameSettings
): string {
  switch (templateId) {
    case 'treasure-hunt':   return treasureHuntTemplate(questions, settings);
    case 'tug-of-war':      return tugOfWarTemplate(questions, settings);
    case 'territory':       return territoryTemplate(questions, settings);
    case 'bomb-defuse':     return bombDefuseTemplate(questions, settings);
    case 'mountain-climb':  return mountainClimbTemplate(questions, settings);
    case 'mosaic-reveal':   return mosaicRevealTemplate(questions, settings);
    case 'wheel-fortune':   return wheelFortuneTemplate(questions, settings);
    case 'rpg-battle':      return rpgBattleTemplate(questions, settings);
    default:                return rpgBattleTemplate(questions, settings);
  }
}

export * from './types';
