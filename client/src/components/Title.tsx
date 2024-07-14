import { Grid, Typography } from "@mui/material";
import Logo from "../assets/svg/Logo";

export default function Title() {
    return (
        <Grid
            container
            item
            justifyContent="center"
            alignItems="center"
            margin="20px"
        >
            <Typography variant="h3">
                LRU Cache - Temporary Cache Storage
            </Typography>
            <Logo />
        </Grid>
    );
}
