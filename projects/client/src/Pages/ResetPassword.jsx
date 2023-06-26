import React, { useState } from "react";
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    InputGroup, InputRightElement, FormErrorMessage, useToast
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import Loading from "../Components/Loading";

export default function ResetPassword() {
    const [loadingPage, setLoadingPage] = useState(true);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const navigate = useNavigate();
    const params = useParams(); //data token di params
    const [loading, setLoading] = React.useState(false);
    const toast = useToast();

    const onBtnResetPassword = async () => {
        try {
            setLoading(true);
            await formik.validateForm();
            if (!formik.isValid) {
                return;
            }
            let response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/user/reset-password`, {
                newPassword: formik.values.newPassword,
                confirmationPassword: formik.values.passwordConfirmation,
                otp: formik.values.verificationCode
            }, {
                headers: {
                    Authorization: `Bearer ${params.token}`
                }
            });
            toast({
                title: response.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/", { replace: true });
        } catch (error) {
            console.log("ini error dari onBtnResetPassword : ", error);
            if (error.response && !error.response.data.message) {
                toast({
                    title: "Reset password failed",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
            if (error.response && error.response.status === 401) {
                toast({
                    title: "Your code has expired. Please resend reset password request email for your account.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                navigate("/", { replace: true });
            } else {
                toast({
                    title: error.response.data.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } finally {
            setLoading(false);
        }
    }

    const formik = useFormik({
        initialValues: {
            newPassword: "",
            passwordConfirmation: "",
            verificationCode: ""
        },
        onSubmit: onBtnResetPassword,
        validationSchema: yup.object().shape({
            newPassword: yup
                .string()
                .required("New password is a required field")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/,
                    "Password must be at least 6 characters includes 1 number, 1 uppercase, and 1 lowercase letter"
                ),
            passwordConfirmation: yup
                .string()
                .required("Confirmation password is a required field")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/,
                    "Password must be at least 6 characters includes 1 number, 1 uppercase, and 1 lowercase letter"
                )
                .oneOf([yup.ref("newPassword"), null], "Passwords must match"), //check if the value matches "password" field
            verificationCode: yup.string()
                .required("OTP code is a required field")
        })
    });

    const handleForm = (event) => {
        formik.setFieldValue(event.target.name, event.target.value);
    };

    React.useEffect(() => {
        setTimeout(() => {
            setLoadingPage(false);
        }, 1700);
    }, []);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <Flex
                minH={{ base: "100vh", sm: "100vh" }}
                align={{ base: "none", sm: "center" }}
                justify={"center"}
                bg={"white"}>
                <Stack
                    spacing={8}
                    w={"full"}
                    maxW={"md"}
                    bg={"white"}
                    rounded={"xl"}
                    borderWidth={"1px"}
                    borderColor={{ base: "white", sm: "gray.300" }}
                    p={6}
                    my={12}>
                    <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
                        Enter new password
                    </Heading>
                    {/* New Password Field */}
                    <FormControl id="newpassword" isInvalid={formik.errors.newPassword}>
                        <FormLabel>New Password</FormLabel>
                        <InputGroup>
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                onChange={handleForm}
                                name="newPassword"
                            />
                            <InputRightElement h={"full"}>
                                <Button
                                    variant={"ghost"}
                                    _hover={"none"}
                                    _active={"none"}
                                    onClick={() =>
                                        setShowNewPassword(
                                            (showNewPassword) => !showNewPassword
                                        )
                                    }
                                >
                                    {showNewPassword ? (
                                        <ViewIcon />
                                    ) : (
                                        <ViewOffIcon />
                                    )}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.newPassword}</FormErrorMessage>
                    </FormControl>
                    {/* Confirm New Password  */}
                    <FormControl id="confirmation_password" isInvalid={formik.errors.passwordConfirmation}>
                        <FormLabel>Confirm New Password</FormLabel>
                        <InputGroup>
                            <Input
                                type={showPasswordConfirmation ? "text" : "password"}
                                onChange={handleForm}
                                name="passwordConfirmation"
                            />
                            <InputRightElement h={"full"}>
                                <Button
                                    variant={"ghost"}
                                    _hover={"none"}
                                    _active={"none"}
                                    onClick={() =>
                                        setShowPasswordConfirmation(
                                            (showPasswordConfirmation) =>
                                                !showPasswordConfirmation
                                        )
                                    }
                                >
                                    {showPasswordConfirmation ? (
                                        <ViewIcon />
                                    ) : (
                                        <ViewOffIcon />
                                    )}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.passwordConfirmation}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={formik.errors.verificationCode}>
                        <FormLabel>To complete your password reset, please enter the OTP code sent to your email below :</FormLabel>
                        <Input type="text"
                            onChange={handleForm}
                            name="verificationCode"
                        />
                        <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.verificationCode}</FormErrorMessage>
                    </FormControl>
                    <Stack pt="4">
                        <Button
                            bg={"#D3212D"}
                            color={"white"}
                            _hover={{
                                bg: "#D3212D",
                            }}
                            type="button"
                            onClick={onBtnResetPassword}
                            isLoading={loading}
                        >
                            Reset Password
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
        );
    }
}
