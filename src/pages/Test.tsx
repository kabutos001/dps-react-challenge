import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../util/api.service";
import { Locality } from "../util/interfaces";


function useDebounceValue(value: string, time = 250) {
    const [debounceValue, setDebounceValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebounceValue(value);
        }, time);

        return () => {
            clearTimeout(timeout);
        }
    }, [value, time]);

    return debounceValue;
}

export default function Test() {
    // page == 0 is invalid for this API, manual handling required
    const [page, setPage] = useState(1);
    const [locality, setLocality] = useState<string>("");
    const [PLZQuery, setPLZQuery] = useState<string>("");
    const [postalCodes, setPostalCodes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [localityError, setLocalityError] = useState<string>("");
    const [postalCodeError, setPostalCodeError] = useState<string>("");

    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const debounceQuery = useDebounceValue(locality, 1000);
    const debouncePLZQuery = useDebounceValue(PLZQuery, 1000);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        (async () => {
            // avoid race conditions by cancelling all currently running requests
            // whenever a new one is made
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            setIsLoading(true);
            if ((!locality || locality.length < 3) || (!page || page < 1)) {
                setPostalCodes([]);
                setShowDropdown(false);
                return;
            }
            try {
                const response = await fetch(
                    `${BASE_URL}/Localities?name=${debounceQuery}&page=${page}`,
                    { signal: abortControllerRef.current?.signal } // renew controller, can't reuse them
                );
                const PLZs = (await response.json()) as Locality[];

                if (PLZs.length === 0) {
                    setLocalityError("Keine Ortschaft unter gegebenem Namen vorhanden.");
                    setPostalCodes([]);
                    setShowDropdown(false);
                } else if (PLZs.length === 1) {
                    setPLZQuery(PLZs[0].postalCode);
                    setPostalCodes([]);
                    setShowDropdown(false);
                } else {
                    setPostalCodes(Array.from(PLZs.map(l => l.postalCode)).sort());
                    setShowDropdown(true);
                }
            } catch (err: any) {
                if (err.name == "AbortError") {
                    console.log("Aborted");
                    return;
                }
                setLocalityError(err);
            } finally {
                setIsLoading(false);
            }
        })(); //IIFE
    }, [debounceQuery, page]);

    useEffect(() => {
        (async () => {
            // avoid race conditions by cancelling all currently running requests
            // whenever a new one is made
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            setIsLoading(true);
            setPostalCodeError("");
            if (showDropdown || (!PLZQuery || PLZQuery.length < 3) || (!page || page < 1)) return;

            try {
                const response = await fetch(
                    `${BASE_URL}/Localities?postalCode=${debouncePLZQuery}&page=${page}`,
                    { signal: abortControllerRef.current?.signal } // renew controller, can't reuse them
                );
                const PLZs = (await response.json()) as Locality[];

                if (PLZs.length === 0) {
                    setPostalCodeError("Postleitzahl nicht vorhanden.");
                } else {
                    setLocality(PLZs[0].name);
                    setPostalCodeError("");
                }
            } catch (err: any) {
                if (err.name == "AbortError") {
                    console.log("Aborted");
                    return;
                }
                setPostalCodeError(err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [debouncePLZQuery, page, showDropdown]);

    const handlePostalCodeSelect = (value: string) => {
        setPostalCodeError(value);
        setShowDropdown(false);
    }

    return (
        <div>
            <h1 className="mb-4 text-2xl">Postal Code Registry</h1>
            <span>{isLoading && "Loading data..."}</span>

            <div>
                <input
                    id="locality"
                    type="text"
                    placeholder="Search a City/Town, e.g. Berlin"
                    value={locality}
                    onChange={e => {
                        setLocality(e.target.value);
                        setLocalityError("");
                    }}
                />
                {localityError && <span>{localityError}</span>}
            </div>
            {showDropdown ?
                <div>
                    <select value={PLZQuery} onChange={handlePostalCodeSelect}>
                        {postalCodes.map((plz) => {
                            return <option key={plz} value={plz}>{plz}</option>
                        })}
                    </select>
                </div>
                : <input type="text" placeholder="Search a postal code" value={PLZQuery} onChange={e => { setPLZQuery(e.target.value) }} />
            }
            <p>{postalCodes && postalCodes.length > 0 && JSON.stringify(postalCodes[0])}</p>
            {/*<button onClick={() => setPage(page + 1)}>Next page (Current:{page})</button>*/}
        </div >
    );
}
