export interface Quest {
    id: number;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    recommended_level: number;
    reward: string;
}

export interface QuestResponse {
    quests: Quest[];
} 