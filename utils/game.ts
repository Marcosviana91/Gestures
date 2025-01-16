class Game {
    connection_status = 4;
    game_id = 0;
    room_list: RoomAPI[] = []
    match_id: string = ''
    players: number[] = []
    players_ready: number[] = []
    players_stats: PlayersInMatchApiProps[] = []
    cards_processed_media = new Map()

    handleWS(incoming: WebSocketData) {
        switch (incoming.data_type) {
            case 'room_data':
                console.log("room_data");
                if (incoming.data_command === 'room_stats') {
                    const data = incoming.data as RoomAPI;
                    this.match_id = data.id
                    this.players = data.players
                    this.players_ready = data.players_ready
                } else if (incoming.data_command === 'leave_room') {
                    this.leave_room()
                } else if (incoming.data_command === 'room_list') {
                    console.log("room_list", incoming.data)
                    this.room_list = incoming.data as RoomAPI[];
                }
                console.log(this)
                break;
            case 'match_data':
                console.log('data_command - ', incoming.data_command)
                if (incoming.data_command === 'match_start') {
                    console.log('Iniciando a Partida')
                    const match_data = incoming.data as MatchAPI
                    this.match_id = match_data.id
                    this.players = match_data.players
                    this.players_stats = match_data.players_stats
                    // Limpar
                    this.room_list = []
                    this.players_ready = []
                } else if (incoming.data_command === 'update_player') {
                    const player_data = this.getPlayerData(incoming.player_id!)
                    player_data!.cards_in_game = incoming.data.player_stats!.cards_in_game
                    player_data!.cards_deck = incoming.data.player_stats!.cards_deck
                    player_data!.faith_points = incoming.data.player_stats!.faith_points
                } else if (incoming.data_command === 'update_players') {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const players_data: PlayersInMatchApiProps[] = incoming.data.player_stats!
                    for (let _player of players_data) {
                        const player_data = this.getPlayerData(_player.player_id)
                        player_data!.cards_in_game = _player.cards_in_game
                        player_data!.cards_deck = _player.cards_deck
                        player_data!.faith_points = _player.faith_points
                    }
                } else if (incoming.data_command === 'leave_match') {
                    if (!incoming.data) {
                        this.leave_room()
                    }
                }
            default:
                break;
        }
        // console.log('requests: ', this.requests)
    }

    reset() {
        this.connection_status = 4
        this.game_id = 0
        this.room_list = []
        this.match_id = ''
        this.players = []
        this.players_ready = []
        this.players_stats = []
    }

    leave_room() {
        this.match_id = ''
        this.players = []
        this.players_ready = []
    }

    getPlayerData(player_id: number): PlayersInMatchApiProps | undefined {
        const player_data = this.players_stats.find(_player => _player.player_id === player_id)
        return player_data
    }
}

export const game = new Game()