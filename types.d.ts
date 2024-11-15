
declare type PlayersInMatchApiProps = {
    'player_id': string,
    'faith_points': number,
    'total_wisdom_points': number,
    'available_wisdom_points': number,
    'cards_in_game': CardProps[],
    'cards_deck': CardProps[],
}

declare type CardProps = {
    // Dados vem da API e NÃO mudam durante o jogo
    slug: string,
    in_game_id: string,
    card_family: string,
    card_type: string,
    
    // Dados vem da API e PODEM mudar durante o jogo
    // deck : ninguém sabe qual é a carta;
    // hand : somente o dono sabe qual é a carta;
    // playmat : todos sabem qual é a carta
    // attached : a carta está acoplada a outra e não é exibida
    where_i_am: 'deck' | 'hand' | 'playmat' | 'attached',
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
    data_type: string //'accepted' | 'start' | 'card_move' | 'give_card' | 'back_to_deck' | 'give_wisdom' | 'toggle_wisdom' | 'take_wisdom' | 'change_faith_points';
    room_stats?: {
        'id': string,
        'players': string[],
        'players_ready': string[],
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

