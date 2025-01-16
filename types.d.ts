
declare type PlayersInMatchApiProps = {
    'player_id': number,
    'faith_points': number,
    'cards_in_game': CardProps[],
    'cards_deck': CardProps[],
}

declare type CardProps = {
    description?: string,
    // Dados vem da API e NÃO mudam durante o jogo
    slug: string,
    in_game_id: string,
    card_family: string,
    // card_type: string,

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
    data_type: string
    data_command: string,
    data: {
        match_id?: string,
        card_family?: string,
        player_stats?: PlayersInMatchApiProps,
        card?: CardProps,
        faith_points?: number,
        card_list?: string[]
        player_target_id?: number
        player_trigger_id?: number
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

// https://costamateus.com.br/faithbattle/deck
declare type deckBuilderFromMateusCosta = [
    {
        id: number,
        name: string,
        collection: string,
        effect: string,
        quote: string,
        serial_number: string,
        category: string,
        is_exclusive?: number,
        properties: {
            id: number,
            card_id: number,
            cost: number,
            atk?: number,
            def?: number,
        },
        images: [
            {
                id: number,
                card_id: number,
                path: string,
                exclusive_text?: string,
                is_exclusive?: number
            }
        ],
        relations: [
            {
                card_id: number,
                related_card_id: number
            },
        ],
        synergies: [],
        count: number // quantidade de repetições 1 ou 2
    },
]

declare type GameNotification = {
    id?: number,
    data_command: string,
    title: string,
    player_id: number,
    content: string,
}

declare type GameRequest = {
    data_command: string,
    title: string,
    player_trigger_id: number,
    player_target_id: number,
    content: string,
    data: WebSocketData,
}
