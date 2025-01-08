
declare type PlayersInMatchApiProps = {
    'player_id': number,
    'faith_points': number,
    'total_wisdom_points': number,
    'available_wisdom_points': number,
    'cards_in_game': CardProps[],
    'cards_deck': CardProps[],
}

declare type CardProps = {
    description?: string,
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
    visible?: boolean,
    orientation: number,
    tags: string[],
}

declare type CardMatchReducerProps = {
    cards: CardProps[],
}

declare type WebSocketData = {
    data_type: string //'accepted' | 'start' | 'card_move' | 'give_card' | 'back_to_deck'  | 'change_faith_points';
    data_command: string,
    data: {
        match_id?: string,
        card_family?: string,
        player_stats?: PlayersInMatchApiProps,
        card?: CardProps,
        faith_points?: number,
    },
    player_id?: number
}

declare type UserProps = {
    id: number,
    last_login: string,
    username: string,
    email: string,
    first_name: string,
    avatar: string,
}

declare type RoomAPI =
    {
        id: string,
        game_id: string,
        has_password: boolean,
        players: number[],
        players_ready: number[],
    }

declare type MatchAPI =
    {
        id: string,
        players: number[],
        players_stats: PlayersInMatchApiProps[],
    }

declare type GameListAPI = {
    [key: number]: string,
}

declare type GameDetailsAPI = {
    title: string,
    description: string,
    image: string,
    gameBoard: [
        {
            'name': string,
            'image': string,
        }
    ],
    deckType: [
        {
            id: number,
            title: string,
            image: string,
            deck_position_X: number,
            deck_position_Y: number,
            cards: {
                'bottom_left_value': number,
                'bottom_right_value': number,
                'card_slug': string,
                'card_image': string,
                'card_image_mini': string,
                'card_description': string
            }[]
        },
    ]
}
