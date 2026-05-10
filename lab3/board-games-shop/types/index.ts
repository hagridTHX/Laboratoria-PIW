export interface Auction {
    starting_price: number;
    current_bid: number;
    highest_bidder_uid: string;
}

export interface BoardGame {
    id: number;
    title: string;
    images: string[];
    description: string[];
    min_players: number;
    max_players: number;
    avg_play_time_minutes: number;
    publisher: string;
    is_expansion: boolean;
    price_pln: number;
    type: string;
    auction: Auction | null;
}