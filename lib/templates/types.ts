// Shared types for all game templates
export interface GameQuestion {
  q: string;          // Question text (Vietnamese)
  answers: string[];  // Always exactly 4 answer choices
  correct: number;    // Index 0-3 of correct answer
  explain?: string;   // Brief explanation shown after answering
}

export interface GameSettings {
  topic: string;
  difficulty: string;   // 'easy' | 'medium' | 'hard'
  useTimer: boolean;
  useScoring: boolean;
  rewardPenalty: string;
  questionCount: number;
  playerMode: '1p' | '2p';  // single player or 2-player hotseat
  player1Name: string;
  player2Name: string;
}

// All 8 template IDs
export type TemplateId =
  | 'treasure-hunt'
  | 'tug-of-war'
  | 'territory'
  | 'bomb-defuse'
  | 'mountain-climb'
  | 'mosaic-reveal'
  | 'wheel-fortune'
  | 'rpg-battle';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  emoji: string;
  desc: string;
  color: string;   // gradient for card
  players: string; // "1-2 người" etc.
  supportsMultiplayer?: boolean;  // shows 2p mode selector
  supportsImageUpload?: boolean;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'treasure-hunt',
    name: 'Kho Báu Tri Thức',
    emoji: '🗺️',
    desc: 'Vượt qua câu hỏi để tiến trên bản đồ, tìm kho báu trước kẻ thù!',
    color: 'linear-gradient(135deg, #d4a017, #f59e0b)',
    players: '1 người',
  },
  {
    id: 'tug-of-war',
    name: 'Kéo Co Tri Thức',
    emoji: '🪢',
    desc: 'Đấu kiến thức với đối thủ — ai đúng trước kéo dây về phía mình!',
    color: 'linear-gradient(135deg, #dc2626, #f97316)',
    players: '1 vs AI / 2 người',
    supportsMultiplayer: true,
  },
  {
    id: 'territory',
    name: 'Chiếm Đất',
    emoji: '🏰',
    desc: 'Trả lời đúng để chiếm ô trên bản đồ lưới. Nhiều đất nhất thắng!',
    color: 'linear-gradient(135deg, #059669, #10b981)',
    players: '1 vs AI / 2 người',
    supportsMultiplayer: true,
  },
  {
    id: 'bomb-defuse',
    name: 'Bom Đếm Ngược',
    emoji: '💣',
    desc: 'Đúng + thời gian, Sai - thời gian. Phá bom trước khi nổ!',
    color: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    players: '1 người',
  },
  {
    id: 'mountain-climb',
    name: 'Leo Núi',
    emoji: '🏔️',
    desc: 'Hai người leo núi song song. Ai đúng trước leo nhanh hơn, lên đỉnh trước thắng!',
    color: 'linear-gradient(135deg, #0369a1, #38bdf8)',
    players: '1 vs AI / 2 người',
    supportsMultiplayer: true,
  },
  {
    id: 'mosaic-reveal',
    name: 'Giải Mã Bức Ảnh',
    emoji: '🔍',
    desc: 'Trả lời đúng để lật mở từng ô ảnh bí ẩn. Đoán ảnh sớm được điểm cao hơn!',
    color: 'linear-gradient(135deg, #be185d, #ec4899)',
    players: '1 người',
    supportsImageUpload: true,
  },
  {
    id: 'wheel-fortune',
    name: 'Vòng Quay Vận Mệnh',
    emoji: '🎡',
    desc: 'Quay bánh xe để nhận nhân điểm, rồi trả lời câu hỏi để giành điểm!',
    color: 'linear-gradient(135deg, #0891b2, #06b6d4)',
    players: '1-4 người',
  },
  {
    id: 'rpg-battle',
    name: 'Đấu Trường RPG',
    emoji: '⚔️',
    desc: 'Chiến đấu RPG! Trả lời đúng để tấn công. Combo 3 câu liên tiếp = Ultimate!',
    color: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
    players: '1 vs AI',
  },
];
