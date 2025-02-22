import {
    Grid,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCache } from "../../redux/slices/cacheSlice";
import { RootState } from "../../redux/store";
import theme from "../../theme";
import { CacheItem } from "./utils";

export default function CacheTable() {
    const cache = useSelector((state: RootState) => state.cache) as Record<
        string,
        CacheItem
    >;

    const [showValue, setShowValue] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCache = async () => {
            const response = await fetch("/api/cache");
            const data = await response.json();
            dispatch(setCache(data.items));
        };
        fetchCache();
    }, []);

    return Object.keys(cache).length > 0 ? (
        <Grid
            container
            spacing={2}
            direction="column"
            justifyContent="center"
            alignContent="center"
        >
            <Typography variant="h4" textAlign="center" mb={2}>
                Live Cache Table
            </Typography>
            <Tooltip title="Toggle value visibility" placement="right">
                <Grid
                    sx={{ width: "50%" }}
                    container
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                >
                    <Typography>Show value</Typography>
                    <Switch
                        checked={showValue}
                        onChange={() => setShowValue(!showValue)}
                    />
                </Grid>
            </Tooltip>
            <TableContainer sx={{ width: "50%" }} component={Paper}>
                <Table aria-label="cache-table">
                    <TableHead>
                        <TableRow
                            sx={{
                                backgroundColor: theme.palette.grey[500],
                            }}
                        >
                            <TableCell>Key</TableCell>
                            {showValue && <TableCell>Value</TableCell>}
                            <TableCell>Expiry</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(cache).map(
                            ([key, { expiry, value }]: [string, CacheItem]) => (
                                <TableRow
                                    key={key}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Typography>{key}</Typography>
                                    </TableCell>
                                    {showValue && (
                                        <TableCell align="left">
                                            <Typography>{value}</Typography>
                                        </TableCell>
                                    )}
                                    <TableCell align="left">
                                        <Typography>{expiry}</Typography>
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    ) : (
        <Typography variant="h3">No items in cache to display</Typography>
    );
}
