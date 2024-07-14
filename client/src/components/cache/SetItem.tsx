import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Box,
    FormControl,
    Grid,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import theme from "../../theme";
import "./index.css";
import { Message, MessageType, SetItemFormValues } from "./utils";

const validationSchema = yup.object({
    key: yup.string().required("Key is required"),
    value: yup.string().required("Value is required"),
    expiry: yup
        .string()
        .required("Expiry is required")
        .test(
            "is-number",
            "Expiry time should be a number",
            (value) => !isNaN(Number(value))
        )
        .test(
            "min-value",
            "Expiry time should be greater than 0",
            (value) => Number(value) > 0
        ),
});

export default function SetItem() {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<Message>({
        data: "",
        type: MessageType.NONE,
    });
    const [timeUnit, setTimeUnit] = useState<string>("seconds");

    const handleTimeUnitChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTimeUnit(event.target.value);
    };

    const convertToSeconds = (value: string, unit: string) => {
        const numValue = parseInt(value);
        switch (unit) {
            case "minutes":
                return numValue * 60;
            case "hours":
                return numValue * 3600;
            default:
                return numValue;
        }
    };

    const formik = useFormik({
        initialValues: {
            key: "",
            value: "",
            expiry: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values: SetItemFormValues) => {
            setLoading(true);
            setMessage({
                data: "",
                type: MessageType.NONE,
            });
            formik.resetForm();
            try {
                const expiryInSeconds = convertToSeconds(
                    values.expiry,
                    timeUnit
                );
                await axios.post(`/api/cache/${values.key}`, {
                    value: values.value,
                    expiry: expiryInSeconds,
                });
                setMessage({
                    data: "Item added to cache successfully",
                    type: MessageType.SUCCESS,
                });
            } catch (error: any) {
                setMessage({
                    data: "Something went wrong, please try again later.",
                    type: MessageType.ERROR,
                });
            } finally {
                setTimeout(() => {
                    setMessage({
                        data: "",
                        type: MessageType.NONE,
                    });
                }, 3000);
                setLoading(false);
            }
        },
    });

    return (
        <Box>
            <FormControl component="fieldset" sx={{ width: "100%" }}>
                <Grid
                    container
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-evenly"
                    sx={{ padding: "20px" }}
                >
                    <TextField
                        id="key"
                        name="key"
                        margin="normal"
                        label="Key"
                        variant="outlined"
                        size="medium"
                        value={formik.values.key}
                        onChange={formik.handleChange}
                        error={formik.touched.key && Boolean(formik.errors.key)}
                        helperText={formik.touched.key && formik.errors.key}
                        className="set-form-input"
                    />
                    <TextField
                        id="value"
                        name="value"
                        margin="normal"
                        label="Value"
                        variant="outlined"
                        size="medium"
                        multiline
                        value={formik.values.value}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.value && Boolean(formik.errors.value)
                        }
                        helperText={formik.touched.value && formik.errors.value}
                        className="set-form-input"
                    />
                    <TextField
                        id="expiry"
                        name="expiry"
                        margin="normal"
                        label="Expiry"
                        variant="outlined"
                        size="medium"
                        value={formik.values.expiry}
                        onChange={formik.handleChange}
                        error={
                            formik.touched.expiry &&
                            Boolean(formik.errors.expiry)
                        }
                        helperText={
                            formik.touched.expiry && formik.errors.expiry
                        }
                        className="set-form-input"
                    />
                    <TextField
                        id="timeUnit"
                        name="timeUnit"
                        select
                        margin="normal"
                        label="Time Unit"
                        variant="outlined"
                        size="medium"
                        value={timeUnit}
                        onChange={handleTimeUnitChange}
                        className="set-form-input"
                    >
                        <MenuItem value="seconds">Seconds</MenuItem>
                        <MenuItem value="minutes">Minutes</MenuItem>
                        <MenuItem value="hours">Hours</MenuItem>
                    </TextField>
                    <LoadingButton
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                        }}
                        variant="contained"
                        size="large"
                        endIcon={<AddIcon />}
                        loading={loading}
                        className="set-form-button"
                    >
                        <Typography>Add</Typography>
                    </LoadingButton>
                </Grid>
                {message.data && (
                    <Typography
                        textAlign="center"
                        fontSize="15px"
                        margin="10px"
                        color={
                            message.type === MessageType.SUCCESS
                                ? theme.palette.success.main
                                : theme.palette.error.main
                        }
                    >
                        {message.data}
                    </Typography>
                )}
            </FormControl>
        </Box>
    );
}
