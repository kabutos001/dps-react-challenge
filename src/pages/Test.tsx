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
    const [postalCode, setPostalCode] = useState<string>("");
    const [postalCodes, setPostalCodes] = useState<string[]>([]);

    const [localityError, setLocalityError] = useState<string>("");
    const [postalCodeError, setPostalCodeError] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const debounceLocality = useDebounceValue(locality, 1000);
    const debouncePostalCode = useDebounceValue(postalCode, 1000);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        (async () => {
            // avoid race conditions by cancelling all currently running requests
            // whenever a new one is made
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            setIsLoading(true);
            if ((!debounceLocality || debounceLocality.length < 3) || (!page || page < 1)) {
                setPostalCodes([]);
                setShowDropdown(false);
                return;
            }
            try {
                const response = await fetch(
                    `${BASE_URL}/Localities?name=${debounceLocality}&page=${page}`,
                    { signal: abortControllerRef.current?.signal } // renew controller, can't reuse them
                );
                const PLZs = (await response.json()) as Locality[];

                if (PLZs.length === 0) {
                    setLocalityError("Keine Ortschaft unter gegebenem Namen vorhanden.");
                    setPostalCodes([]);
                    setShowDropdown(false);
                } else if (PLZs.length === 1) {
                    setPostalCode(PLZs[0].postalCode);
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
    }, [debounceLocality, page]);

    useEffect(() => {
        if (showDropdown) return;

        (async () => {
            // avoid race conditions by cancelling all currently running requests
            // whenever a new one is made
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            setIsLoading(true);
            setPostalCodeError("");
            if (showDropdown || (!debouncePostalCode || debouncePostalCode.length < 3) || (!page || page < 1)) return;

            try {
                const response = await fetch(
                    `${BASE_URL}/Localities?postalCode=${debouncePostalCode}&page=${page}`,
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
    }, [debouncePostalCode, page, showDropdown]);

    const handlePostalCodeSelect = (value: string) => {
        setPostalCode(value);
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
                    <select value={postalCode} onChange={e => { handlePostalCodeSelect(e.target.value) }}>
                        {postalCodes.map((plz) => {
                            return <option key={plz} value={plz}>{plz}</option>
                        })}
                    </select>
                </div>
                : <input
                    type="text"
                    placeholder="Search a postal code"
                    value={postalCode}
                    onChange={e => {
                        setPostalCode(e.target.value);
                        setPostalCodeError("");
                    }} />
            }
            {localityError && <span>{localityError}</span>}
            {/*<button onClick={() => setPage(page + 1)}>Next page (Current:{page})</button>*/}
        </div >
    );
}
