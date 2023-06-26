import React, { useRef, useState } from "react";
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Image,
    FormErrorMessage,
    Text, Icon, HStack, Box, Center, Card, CardBody, InputGroup, InputRightElement, useToast, InputLeftElement
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUpload } from "react-icons/fi";
import { useFormik } from "formik";
import * as yup from "yup";
import tenantRegisterBanner from "../assets/tenant-register-banner.webp";
import Loading from "../Components/Loading";
import noimage from "../assets/noimage.png";

export default function TenantRegister() {
    const [loadingPage, setLoadingPage] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const navigate = useNavigate();
    const inputFile = useRef(null);
    const [image, setImage] = useState(noimage);
    const [loading, setLoading] = React.useState(false);
    const toast = useToast();

    const onBtnRegister = async () => {
        try {
            setLoading(true);
            await formik.validateForm();
            let formData = new FormData();
            formData.append("name", formik.values.name);
            formData.append("email", formik.values.email);
            formData.append("phone", formik.values.phone);
            formData.append("password", formik.values.password);
            formData.append("confirmationPassword", formik.values.passwordConfirmation);
            //1. function that will read the file image and return a Promise that resolves with the base64 data:
            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });
            const fileBase64 = await toBase64(formik.values.fileImage);
            formData.append("images", fileBase64);
            if (!formik.isValid) {
                return;
            }
            let response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/register-as-tenant`,
                formData
            );
            toast({
                title: response.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/", { replace: true });
        } catch (error) {
            console.log("ini error dari onBtnRegister : ", error);
            if (error.response && !error.response.data.message) {
                toast({
                    title: "Register failed",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
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
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            phone: "",
            email: "",
            password: "",
            passwordConfirmation: "",
            fileImage: ""
        },
        onSubmit: onBtnRegister,
        validationSchema: yup.object().shape({
            name: yup
                .string()
                .required("Name is a required field")
                .matches(
                    /^[a-zA-Z ]+$/,
                    "Name must only contain letters and spaces"
                ),
            phone: yup
                .string()
                .required("Phone is a required field")
                .matches(
                    /^\+?[0-9]{8,14}$/,
                    "Please enter a valid phone number"
                ),
            email: yup
                .string()
                .required("Email is a required field")
                .matches(
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    "Please enter a valid email address"
                ),
            password: yup
                .string()
                .required("Password is a required field")
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
                .oneOf([yup.ref("password"), null], "Passwords must match"),
            fileImage: yup
                .mixed()
                .required("KTP photo is a required field")
                .test(
                    "fileSize",
                    "File size must be less than 1MB",
                    (value) => value && value.size <= 1000000
                )
                .test(
                    "fileFormat",
                    "Only jpg, jpeg, and png formats are allowed",
                    (value) =>
                        value && ["image/jpeg", "image/jpg", "image/png"].includes(value.type)
                )
        }),

    });

    const handleForm = (event) => {
        formik.setFieldValue(event.target.name, event.target.value);
    };

    //untuk upload ktp
    const onChangeFile = (event) => {
        formik.setFieldValue(event.target.name, event.target.files[0]);
    };

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            setLoadingPage(false);
        }, 1700);
    }, []);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <Stack minH={{ lg: "100vh" }}
                direction={{ base: "column", md: "column", lg: "row" }}
            >
                <Flex
                    p={{ base: "8", sm: "0" }}
                    flex={1}
                    align={"center"} justify={"center"}
                >
                    <Stack spacing={0} w={"full"} maxW={{ base: "sm" }}>
                        <Heading fontSize={"3xl"} fontWeight="semibold"
                            my="8"
                        >Register as a Tenant</Heading>
                        <Stack spacing={8}>
                            <HStack>
                                <Box>
                                    {/* NAME */}
                                    <FormControl isInvalid={formik.errors.name}>
                                        <FormLabel>Name</FormLabel>
                                        <Input type="text"
                                            onChange={handleForm}
                                            name="name"
                                        />
                                        <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.name}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                                <Box>
                                    {/* PHONE */}
                                    <FormControl isInvalid={formik.errors.phone}>
                                        <FormLabel>Phone number</FormLabel>
                                        <Input type="text"
                                            onChange={handleForm}
                                            name="phone"
                                        />
                                        <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.phone}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                            </HStack>
                            {/* EMAIL */}
                            <FormControl isInvalid={formik.errors.email}>
                                <FormLabel>Email address</FormLabel>
                                <Input type="email"
                                    onChange={handleForm}
                                    name="email"
                                />
                                <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.email}</FormErrorMessage>
                            </FormControl>
                            {/* PASSWORD */}
                            <FormControl isInvalid={formik.errors.password}>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    {/* Input Password */}
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        onChange={handleForm}
                                        name="password"
                                    />
                                    <InputRightElement h={"full"}>
                                        <Button
                                            variant={"ghost"}
                                            _hover={"none"}
                                            _active={"none"}
                                            onClick={() =>
                                                setShowPassword(
                                                    (showPassword) => !showPassword
                                                )
                                            }
                                        >
                                            {showPassword ? (
                                                <ViewIcon />
                                            ) : (
                                                <ViewOffIcon />
                                            )}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                                <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.password}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={formik.errors.passwordConfirmation}>
                                <FormLabel>Confirmation Password</FormLabel>
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
                            {/* UPLOAD ID CARD */}
                            <FormControl isInvalid={formik.errors.fileImage}>
                                <FormLabel>Upload a photo of your KTP
                                    <Text fontSize="xs">( Image size: max. 1 MB , Image format: .jpg, .jpeg, .png )</Text>
                                </FormLabel>
                                <Image
                                    boxSize="200px"
                                    objectFit="cover"
                                    src={formik.values.fileImage
                                        ? URL.createObjectURL(
                                            formik.values.fileImage
                                        )
                                        : image}
                                    w="full"
                                    borderRadius="8px 8px 0 0"
                                    border="1px solid #CBD5E0"
                                />
                                 <InputGroup w="full">
                                <InputLeftElement pointerEvents="none" children={<Icon as={FiUpload} color="black" ml={{ base: "6", sm: "10" }} mt={"5"} fontSize={"2xl"}  />} />
                                {/* Upload your id card */}
                                <Input
                                    py="4"
                                    pl={{ base: "16", sm: "20" }}
                                    type="file"
                                    id="file"
                                    ref={inputFile}
                                    onChange={onChangeFile}
                                    accept="image/*"
                                    variant="unstyled"
                                    name="fileImage"
                                    bg={"gray.200"} color={"gray.800"}
                                    borderRadius="0 0 8px 8px"
                                    textAlign={'center'}
                                ></Input>
                                </InputGroup>
                                <FormErrorMessage fontSize="xs" style={{ position: "absolute", top: "100%", marginTop: "0.30rem" }}>{formik.errors.fileImage}</FormErrorMessage>
                            </FormControl>
                        </Stack>
                        <Stack
                            pt="10"
                        >
                            <Button bg={"#D3212D"} color={"white"} variant={"solid"}
                                _hover={{
                                    bg: "#D3212D",
                                }}
                                onClick={onBtnRegister}
                                isLoading={loading}
                            >
                                Register
                            </Button>
                            {/* Login */}
                        </Stack>
                        <Stack
                            pb="6"
                            px="10"
                        >
                            <Card variant="none" borderColor="#d0d7de" mt="2">
                                <CardBody>
                                    <Center>
                                        <HStack fontSize="sm"
                                        >
                                            <Text>Have an account?</Text>
                                            <Text onClick={() => {
                                                navigate("/");
                                            }} color="#0969da"
                                                cursor={"pointer"}
                                            >
                                                Login.
                                            </Text>
                                        </HStack>
                                    </Center>
                                </CardBody>
                            </Card>
                        </Stack>
                    </Stack>
                </Flex>
                <Flex
                    flex={1}
                    display={{ base: "flex", sm: "flex" }}
                >
                    <Image
                        alt={"User Register Page Image"}
                        objectFit={"cover"}
                        src={tenantRegisterBanner}
                        h={{ base: "30vh", sm: "50vh", lg: "full" }}
                        w="full"
                    />
                </Flex>
            </Stack>
        );
    }
}
