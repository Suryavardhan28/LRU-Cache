import { Grid } from "@mui/material";
import CacheForm from "./CacheForm";
import CacheTable from "./CacheTable";

export default function Cache() {
    return (
        <Grid container>
            <Grid container item padding="20px 100px">
                <CacheForm />
            </Grid>
            <Grid container item justifyContent="center" padding="30px 100px">
                <CacheTable />
            </Grid>
        </Grid>
    );
}
