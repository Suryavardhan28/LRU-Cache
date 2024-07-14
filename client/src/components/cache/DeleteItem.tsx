import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, FormControl, Grid, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import theme from "../../theme";
import "./index.css";
import { GetOrDeleteItemFormValues, Message, MessageType } from "./utils";

const validationSchema = yup.object({
    key: yup.string().required("Key is required"),
});

export default function GetItem() {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<Message>({
        data: "",
        type: MessageType.NONE,
    });

    const formik = useFormik({
        initialValues: {
            key: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values: GetOrDeleteItemFormValues) => {
            setLoading(true);
            setMessage({
                data: "",
                type: MessageType.NONE,
            });
            try {
                await axios.delete(`/api/cache/${values.key}`);
                setMessage({
                    data: "Item deleted from cache successfully",
                    type: MessageType.SUCCESS,
                });
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setMessage({
                        data: "Key not found",
                        type: MessageType.ERROR,
                    });
                } else {
                    setMessage({
                        data: "Something went wrong, please try again later.",
                        type: MessageType.ERROR,
                    });
                }
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
                    alignItems="flex-start"
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
                        className="form-input"
                    />
                    <LoadingButton
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            formik.handleSubmit();
                        }}
                        variant="contained"
                        size="large"
                        endIcon={<DeleteOutlineIcon />}
                        loading={loading}
                        className="form-button"
                    >
                        <Typography>Delete</Typography>
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
