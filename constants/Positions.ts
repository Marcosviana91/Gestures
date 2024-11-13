import { CARD_PADDING_Y, CARD_PADDING_X, CARD_HEIGHT, CARD_WIDTH, BOARD_WIDTH, BOARD_HEIGHT } from '@/constants/Sizes';

export const BOARD_POSITIONS = {
    MAO: {
        bottom: 0,
        left: 0,
        width: BOARD_WIDTH - (CARD_WIDTH * 1.5) - CARD_PADDING_X,
        height: 100,
    },
    DK: {
        bottom: 190,
        left: 440,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    DW: {
        bottom: 190,
        left: 384,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    Playmat: {
        bottom: (CARD_HEIGHT * 2) - CARD_PADDING_Y,
        left: 0,
        width: BOARD_WIDTH,
        height: CARD_HEIGHT * 4,
    },
    CL: {
        bottom: (CARD_HEIGHT * 6) - CARD_PADDING_Y,
        left: 0,
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT/4,
    },
}