import { Grid, Paper } from "@mui/material";
import Title from "./components/Title";
import Cache from "./components/cache/Cache";

function App() {
    return (
        <Paper sx={{ minHeight: "100vh" }}>
            <Grid container justifyContent="center" alignItems="center">
                <Title />
                <Cache />
            </Grid>
        </Paper>
    );
}

export default App;
