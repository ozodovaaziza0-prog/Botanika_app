import { flowerById, shadeOf, type Flower } from '../data';
import type { ArtStem } from './FlowerArt';
import type { DiyItem } from '../store';

export const bunchArt = (f: Flower, shadeId: string, stems: number): ArtStem[] => {
  const s = shadeOf(f, shadeId);
  return [{ kind: f.kind, c1: s.hex, c2: s.hex2 ?? s.hex, count: stems }];
};

export const diyArt = (items: DiyItem[]): ArtStem[] =>
  items.map((i) => {
    const f = flowerById(i.flowerId);
    const s = shadeOf(f, i.shadeId);
    return { kind: f.kind, c1: s.hex, c2: s.hex2 ?? s.hex, count: i.qty };
  });
