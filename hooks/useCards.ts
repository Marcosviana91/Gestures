// CARDS
const CARD_LIST = [
    // Verso
    {
        slug: "wisdon-back",
        path: require("@/assets/images/cards/sabedoria_verso.jpg"),
        mini: require("@/assets/images/cards_mini/sabedoria_verso.png"),
    },
    {
        slug: "card-back",
        path: require("@/assets/images/cards/carta_verso.jpg"),
        mini: require("@/assets/images/cards_mini/carta_verso.png"),
    },
    // Artefatos
    {
        slug: "arca-da-alianca",
        path: require("@/assets/images/cards/028 -Arca da Aliança.png"),
        mini: require("@/assets/images/cards_mini/028 -Arca da Aliança.png"),
    },
    {
        slug: "arca-de-noe",
        path: require("@/assets/images/cards/022 - Arca de Noé.png"),
        mini: require("@/assets/images/cards_mini/022 - Arca de Noé.png"),
    },
    {
        slug: "botas-do-evangelho",
        path: require("@/assets/images/cards/043 -Botas do Evagelho.png"),
        mini: require("@/assets/images/cards_mini/043 -Botas do Evagelho.png"),
    },
    {
        slug: "cajado-de-moises",
        path: require("@/assets/images/cards/025 - Cajado de Moisés.png"),
        mini: require("@/assets/images/cards_mini/025 - Cajado de Moisés.png"),
    },
    {
        slug: "capacete-da-salvacao",
        path: require("@/assets/images/cards/044 -Capacete da Salvação.png"),
        mini: require("@/assets/images/cards_mini/044 -Capacete da Salvação.png"),
    },
    {
        slug: "cinturao-da-verdade",
        path: require("@/assets/images/cards/050 - Cinturão da Verdade.png"),
        mini: require("@/assets/images/cards_mini/050 - Cinturão da Verdade.png"),
    },
    {
        slug: "couraca-da-justica",
        path: require("@/assets/images/cards/026 -Couraça da Justiça.png"),
        mini: require("@/assets/images/cards_mini/026 -Couraça da Justiça.png"),
    },
    {
        slug: "escudo-da-fe",
        path: require("@/assets/images/cards/024 -Escudo da Fé.png"),
        mini: require("@/assets/images/cards_mini/024 -Escudo da Fé.png"),
    },
    {
        slug: "espada-do-espirito",
        path: require("@/assets/images/cards/023 - espada do Espíritu.png"),
        mini: require("@/assets/images/cards_mini/023 - espada do Espíritu.png"),
    },
    {
        slug: "os-10-mandamentos",
        path: require("@/assets/images/cards/049 - Os 10 Mandamentos.png"),
        mini: require("@/assets/images/cards_mini/049 - Os 10 Mandamentos.png"),
    },
    // Heróis
    {
        slug: "abraao",
        path: require("@/assets/images/cards/007 - Abraão.png"),
        mini: require("@/assets/images/cards_mini/007 - Abraão.png"),
    },
    {
        slug: "adao",
        path: require("@/assets/images/cards/010 - Adão.png"),
        mini: require("@/assets/images/cards_mini/010 - Adão.png"),
    },
    {
        slug: "daniel",
        path: require("@/assets/images/cards/045 - Daniel.png"),
        mini: require("@/assets/images/cards_mini/045 - Daniel.png"),
    },
    {
        slug: "davi",
        path: require("@/assets/images/cards/002 - Davi.png"),
        mini: require("@/assets/images/cards_mini/002 - Davi.png"),
    },
    {
        slug: "elias",
        path: require("@/assets/images/cards/003 - Elias.png"),
        mini: require("@/assets/images/cards_mini/003 - Elias.png"),
    },
    {
        slug: "ester",
        path: require("@/assets/images/cards/047 - Ester.png"),
        mini: require("@/assets/images/cards_mini/047 - Ester.png"),
    },
    {
        slug: "eva",
        path: require("@/assets/images/cards/005 - Eva.png"),
        mini: require("@/assets/images/cards_mini/005 - Eva.png"),
    },
    {
        slug: "jaco",
        path: require("@/assets/images/cards/009 - Jacó.png"),
        mini: require("@/assets/images/cards_mini/009 - Jacó.png"),
    },
    {
        slug: "jose-do-egito",
        path: require("@/assets/images/cards/011 -José do Egito.png"),
        mini: require("@/assets/images/cards_mini/011 -José do Egito.png"),
    },
    {
        slug: "josue",
        path: require("@/assets/images/cards/006 - Josué.png"),
        mini: require("@/assets/images/cards_mini/006 - Josué.png"),
    },
    {
        slug: "maria",
        path: require("@/assets/images/cards/012 - Maria.png"),
        mini: require("@/assets/images/cards_mini/012 - Maria.png"),
    },
    {
        slug: "moises",
        path: require("@/assets/images/cards/001 - Moisés.png"),
        mini: require("@/assets/images/cards_mini/001 - Moisés.png"),
    },
    {
        slug: "noe",
        path: require("@/assets/images/cards/046 -Noé.png"),
        mini: require("@/assets/images/cards_mini/046 -Noé.png"),
    },
    {
        slug: "salomao",
        path: require("@/assets/images/cards/004 - Salomão.png"),
        mini: require("@/assets/images/cards_mini/004 - Salomão.png"),
    },
    {
        slug: "sansao",
        path: require("@/assets/images/cards/008 -Sansão.png"),
        mini: require("@/assets/images/cards_mini/008 -Sansão.png"),
    },
    // Lendárias
    {
        slug: "davi-lendario",
        path: require("@/assets/images/cards/053 - Davi (lendário).png"),
        mini: require("@/assets/images/cards_mini/053 - Davi (lendário).png"),
    },
    {
        slug: "josue-lendario",
        path: require("@/assets/images/cards/051 - Josué (lendário).png"),
        mini: require("@/assets/images/cards_mini/051 - Josué (lendário).png"),
    },
    {
        slug: "moises-lendario",
        path: require("@/assets/images/cards/052 - Moisés (Lendário).png"),
        mini: require("@/assets/images/cards_mini/052 - Moisés (Lendário).png"),
    },
    // Milagres
    {
        slug: "cordeiro-de-deus",
        path: require("@/assets/images/cards/029 - Cordeiro de Deus.png"),
        mini: require("@/assets/images/cards_mini/029 - Cordeiro de Deus.png"),
    },
    {
        slug: "diluvio",
        path: require("@/assets/images/cards/021 - Dilúvio.png"),
        mini: require("@/assets/images/cards_mini/021 - Dilúvio.png"),
    },
    {
        slug: "fogo-do-ceu",
        path: require("@/assets/images/cards/014 - Fogo do Céu.png"),
        mini: require("@/assets/images/cards_mini/014 - Fogo do Céu.png"),
    },
    {
        slug: "forca-de-sansao",
        path: require("@/assets/images/cards/013 - Força de Sansão.png"),
        mini: require("@/assets/images/cards_mini/013 - Força de Sansão.png"),
    },
    {
        slug: "liberacao-celestial",
        path: require("@/assets/images/cards/018 - Liberção Celestial.png"),
        mini: require("@/assets/images/cards_mini/018 - Liberção Celestial.png"),
    },
    {
        slug: "no-ceu-tem-pao",
        path: require("@/assets/images/cards/048 - No céu tem Pão.png"),
        mini: require("@/assets/images/cards_mini/048 - No céu tem Pão.png"),
    },
    {
        slug: "passagem-segura",
        path: require("@/assets/images/cards/015 -Passagem Segura.png"),
        mini: require("@/assets/images/cards_mini/015 -Passagem Segura.png"),
    },
    {
        slug: "protecao-divina",
        path: require("@/assets/images/cards/017 - Proteção Divina.png"),
        mini: require("@/assets/images/cards_mini/017 - Proteção Divina.png"),
    },
    {
        slug: "ressurreicao",
        path: require("@/assets/images/cards/019 - Ressurreição.png"),
        mini: require("@/assets/images/cards_mini/019 - Ressurreição.png"),
    },
    {
        slug: "restauracao-de-fe",
        path: require("@/assets/images/cards/016 - Restauração de Fé.png"),
        mini: require("@/assets/images/cards_mini/016 - Restauração de Fé.png"),
    },
    {
        slug: "sabedoria-de-salomao",
        path: require("@/assets/images/cards/042 - Sabedoria de Salomão.png"),
        mini: require("@/assets/images/cards_mini/042 - Sabedoria de Salomão.png"),
    },
    {
        slug: "sarca-ardente",
        path: require("@/assets/images/cards/020 - Sarça Ardente.png"),
        mini: require("@/assets/images/cards_mini/020 - Sarça Ardente.png"),
    },
    // Pecados
    {
        slug: "fruto-proibido",
        path: require("@/assets/images/cards/027 - Fruto Proibído.png"),
        mini: require("@/assets/images/cards_mini/027 - Fruto Proibído.png"),
    },
    {
        slug: "idolatria",
        path: require("@/assets/images/cards/041 - Idolatria.png"),
        mini: require("@/assets/images/cards_mini/041 - Idolatria.png"),
    },
    {
        slug: "traicao",
        path: require("@/assets/images/cards/030 - Traição.png"),
        mini: require("@/assets/images/cards_mini/030 - Traição.png"),
    },
    // Sabedoria
    {
        slug: "wisdom_card_0",
        path: require("@/assets/images/wisdom/wisdom_card_0.jpg")
    },
    {
        slug: "wisdom_card_1",
        path: require("@/assets/images/wisdom/wisdom_card_1.jpg")
    },
    {
        slug: "wisdom_card_2",
        path: require("@/assets/images/wisdom/wisdom_card_2.jpg")
    },
    {
        slug: "wisdom_card_3",
        path: require("@/assets/images/wisdom/wisdom_card_3.jpg")
    },
    {
        slug: "wisdom_card_4",
        path: require("@/assets/images/wisdom/wisdom_card_4.jpg")
    },
    {
        slug: "wisdom_card_5",
        path: require("@/assets/images/wisdom/wisdom_card_5.jpg")
    },
    {
        slug: "wisdom_card_6",
        path: require("@/assets/images/wisdom/wisdom_card_6.jpg")
    },
    {
        slug: "wisdom_card_7",
        path: require("@/assets/images/wisdom/wisdom_card_7.jpg")
    },
    {
        slug: "wisdom_card_8",
        path: require("@/assets/images/wisdom/wisdom_card_8.jpg")
    },
    {
        slug: "wisdom_card_9",
        path: require("@/assets/images/wisdom/wisdom_card_9.jpg")
    },
]


export function getCardImage(
    props: { card_slug: string }
) {
    for (const card of CARD_LIST) {
        if (card.slug === props.card_slug) {
            return card.path
        }
    }
}

export function getCardImageMini(
    props: { card_slug: string }
) {
    for (const card of CARD_LIST) {
        if (card.slug === props.card_slug) {
            return card.mini
        }
    }
}
