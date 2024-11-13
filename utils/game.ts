class GameMatch {
    id: string = ''
    players: string[] = []
    players_stats: PlayersInMatchApiProps[] = []

    getPlayerData(player_name: string): PlayersInMatchApiProps | undefined {
        const player_data = this.players_stats.find(_player => _player.name === player_name)
        return player_data
    }
    setCardsOrder(card: CardProps) {
        const player_card_id = card.in_game_id.split('_')[0]
        const player_data = game.getPlayerData(player_card_id)
        const card_game = player_data?.card_hand
        const __temp_array = card_game?.filter(_card => {
            if (card.in_game_id !== _card.in_game_id) {
                return card
            }
        })
        player_data!.card_hand = [...__temp_array!, card]
        console.log(this)
    }
    removeCardFromDeck(card: CardProps) {
        const player_card_id = card.in_game_id.split('_')[0]
        const player_data = game.getPlayerData(player_card_id)
        const card_game = player_data?.card_deck
        const __temp_array = card_game?.filter(_card => {
            if (card.in_game_id !== _card.in_game_id) {
                return card
            }
        })
        player_data!.card_deck = __temp_array!
    }
    returnCardToDeck(card: CardProps) {
        const player_card_id = card.in_game_id.split('_')[0]
        const player_data = game.getPlayerData(player_card_id)
        const card_game = player_data?.card_hand
        const __temp_array = card_game?.filter(_card => {
            if (card.in_game_id !== _card.in_game_id) {
                return card
            }
        })
        player_data!.card_hand = __temp_array!
    }
    giveWisdom(player_id: string) {
        const player_data = game.getPlayerData(player_id)
        player_data!.total_wisdom_points += 1
        player_data!.available_wisdom_points += 1
    }
    takeWisdom(player_id: string) {
        const player_data = game.getPlayerData(player_id)
        if (player_data!.total_wisdom_points > 0) {
            player_data!.total_wisdom_points -= 1
            player_data!.available_wisdom_points -= 1
        }
    }
    toggleWisdom(player_id: string, increment: boolean) {
        const player_data = game.getPlayerData(player_id)
        if (increment) {
            player_data!.available_wisdom_points += 1
        } else {
            player_data!.available_wisdom_points -= 1
        }
    }
    changeFaithPoints(player_id: string, faith_points: number) {
        console.log('changeFaithPoints', faith_points)
        const player_data = game.getPlayerData(player_id)
            player_data!.faith_points = faith_points

    }
}
export const game = new GameMatch()