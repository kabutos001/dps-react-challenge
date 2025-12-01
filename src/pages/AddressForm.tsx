import React, { useEffect, useState } from "react";
import { PostalData } from "../util/interfaces";

export default function AddressForm() {
    const [formData, setFormData] = useState<PostalData>({ locality: "", postalCodeText: null });
    const [query, setQuery] = useState("");
    const [localities, setLocalities] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setFormData(values => ({ ...values, [name]: value }));
    }

    useEffect(() => {
        (async () => {
            if (!query || query.length < 5) return;
            const response = await fetch(`https://openplzapi.org/de/Localities?name=${query}`);
            const data = await response.json() as PostalData[];
            setLocalities(data);
        })();
    }, [query]);

    // input name attributes have to match state (interface) keys
    return (
        <form>
            <p>Locality: {formData.locality} <br /> PLZ: {formData.postalCodeText}</p>
            <input name="locality" type="text" placeholder="Enter City/Town" value={query} onChange={(e) => { setQuery(e.target.value) }} />
            {/*localities.map(l => <div>{l}</div>)*/}
            <div>{localities ? localities : "Waiting ..."}</div>
            {formData.locality ? (
                <select name="postalCodeSelect">
                    <option value=""></option>
                </select>) :
                <input name="postalCodeText" type="" placeholder="Enter Postal Code (PLZ)" value={formData.postalCodeText ?? ""} onChange={handleChange} />
            }
            {formData.postalCodeText && (isNaN(formData.postalCodeText) ||
                formData.postalCodeText.toString().length > 5) ?
                <p className="errormsg" style={{ color: "red", margin: "0.25rem" }}>Valid postal codes are only four / five digit numbers.</p>
                : <></>}
        </form >

    );
}
