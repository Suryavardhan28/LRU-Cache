import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useState } from "react";
import DeleteItem from "./DeleteItem";
import GetItem from "./GetItem";
import SetItem from "./SetItem";

export default function CacheForm() {
    const [value, setValue] = useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box className="cache-form">
            <Box className="cache-form-tabs">
                <Tabs variant="fullWidth" value={value} onChange={handleChange}>
                    <Tab label="Set Item" />
                    <Tab label="Get Item" />
                    <Tab label="Delete Item" />
                </Tabs>
            </Box>
            {value === 0 && <SetItem />}
            {value === 1 && <GetItem />}
            {value === 2 && <DeleteItem />}
        </Box>
    );
}
