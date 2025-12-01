export interface PostalData {
    locality: string;
    postalCodeText: number | null;
}

export interface Locality {
    postalCode: string;
    name: string;
    municipality: {
        key: string;
        name: string;
    };
    federalState: {
        key: string;
        name: string;
    };
}

export interface LocalityResponse {
    data: Locality[];
    pages: number;
    currentPag: number;
}