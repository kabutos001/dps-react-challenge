import React, { useState } from "react";
import { PostalData } from "./PostalData.interface";

export default function AddressForm() {
    const [formData, setFormData] = useState<PostalData>({ locality: "", postalCodeText: null });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setFormData(values => ({ ...values, [name]: value }));
    }

    // input name attributes have to match state (interface) keys
    return (
        <form>
            <p>Locality: {formData.locality} <br /> PLZ: {formData.postalCodeText} </p>
            <input name="locality" type="text" placeholder="Enter City/Town" value={formData.locality} onChange={handleChange} />
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
