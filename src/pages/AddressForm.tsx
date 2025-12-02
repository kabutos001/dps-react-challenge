import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../components/ui/select";
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
    const [isLoadingLocality, setIsLoadingLocality] = useState(false);
    const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);

    const debounceLocality = useDebounceValue(locality, 1000);
    const debouncePostalCode = useDebounceValue(postalCode, 1000);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        (async () => {
            // avoid race conditions by cancelling all currently running requests
            // whenever a new one is made
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            if ((!debounceLocality || debounceLocality.length < 3) || (!page || page < 1)) {
                setPostalCodes([]);
                setShowDropdown(false);
                return;
            }
            try {
                setIsLoadingLocality(true);
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
                setIsLoadingLocality(false);
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

            setPostalCodeError("");
            if (showDropdown || (!debouncePostalCode || debouncePostalCode.length < 3) || (!page || page < 1)) return;

            try {
                setIsLoadingPostalCode(true);
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
                setIsLoadingPostalCode(false);
            }
        })();
    }, [debouncePostalCode, page, showDropdown]);

    const handlePostalCodeSelect = (value: string) => {
        setPostalCode(value);
        setShowDropdown(false);
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-8">
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Adresssuche Deutschland
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="locality" className="text-sm font-medium">
                            Ortschaft
                        </Label>
                        <div className="relative">
                            <Input
                                id="locality"
                                type="text"
                                value={locality}
                                onChange={(e) => {
                                    setLocality(e.target.value);
                                    setLocalityError('');
                                }}
                                placeholder="z.B. München"
                                className="pr-10"
                            />
                            {isLoadingLocality && (
                                <Loader2 className="absolute right-3 top-1/3 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                        </div>
                        {localityError && (
                            <p className="text-sm text-destructive mt-1">{localityError}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium">
                            PLZ
                        </Label>
                        {showDropdown ? (
                            <Select value={postalCode} onValueChange={handlePostalCodeSelect}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="PLZ auswählen" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {postalCodes.map((code) => (
                                        <SelectItem key={code} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="relative">
                                <Input
                                    id="postalCode"
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => {
                                        setPostalCode(e.target.value);
                                        setPostalCodeError('');
                                    }}
                                    placeholder="z.B. 80331"
                                    className="pr-10"
                                />
                                {isLoadingPostalCode && (
                                    <Loader2 className="absolute right-3 top-1/3 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                        )}
                        {postalCodeError && (
                            <p className="text-sm text-destructive mt-1">{postalCodeError}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
