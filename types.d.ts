declare type MatchApiProps = {
    id?: string;
    start_match?: string;
    game_type?: string;
    round_match?: number;
    player_turn?: number;
    player_focus_id?: number;
    can_others_move?: boolean;
    players_in_match?: [PlayersInMatchApiProps[]];
    end_match?: string;
    card_stack?: {
        cards: CardProps[];
    }
    fight_camp?: {
        player_attack_id?: number;
        attack_cards?: CardProps[];
        player_defense_id?: number;
        defense_cards?: CardProps[];
        fight_stage: number;
    };
}

declare type PlayersInMatchApiProps = {
    'name': string,
    'faith_points': number,
    'total_wisdom_points': number,
    'available_wisdom_points': number,
    'card_deck': CardProps[],
    'card_hand': CardProps[],
    'card_playmat': CardProps[],
    'card_forgotten': CardProps[],

}

declare type CardProps = {
    slug: string,
    in_game_id: string,
    card_type: string,
    // deck : ninguém sabe qual é a carta;
    // hand : somente o dono sabe qual é a carta;
    // playmat : todos sabem qual é a carta
    status: "ready" | "used",
    where_i_am: 'deck' | 'hand' | 'playmat',
    position: {
        left: number,
        bottom: number,
    },
    top_left_value: number,
    top_right_value: number,
    bottom_left_value: number,
    bottom_right_value: number,
    attached_cards: CardProps[],

    path?: ImageSourcePropType,
    is_hidden?: boolean,
    description?: string,
}

declare type CardMatchReducerProps = {
    cards: CardProps[],
}

declare type WebSocketData = {
    data_type: 'accepted' | 'start' | 'card_move' | 'give_card' | 'back_to_deck' | 'give_wisdom' | 'toggle_wisdom' | 'take_wisdom' | 'change_faith_points';
    room_stats?: {
        'id': string,
        'players': string[],
        'players_stats': PlayersInMatchApiProps[]
    }
    player?: string,
    increment?: boolean,
    faith_points?: number,
    card?: CardProps,
    cards?: {
        [key: string]: CardProps[]
    }
}

