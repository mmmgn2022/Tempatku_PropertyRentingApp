import {
    Box,
    Button,
    Flex,
    Image,
    Text,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    RadioGroup,
    Radio,
    Stack,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Icon,
    Spinner,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { StarIcon } from "@chakra-ui/icons";
import { MdPeople } from "react-icons/md";
import CardImage from "../../assets/card_img.png";
import { LockIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
    capitalizeFirstWord,
    formatDateIndo,
    formatRupiah,
} from "../../helper";
import { useSelector } from "react-redux";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import noimage from "../../assets/noimage.png"
import Loading from "../../Components/Loading"

export default function Payments() {
    const [loadingPage, setLoadingPage] = useState(true)
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const emailUser = useSelector((state) => state.authReducer.email);

    let token = localStorage.getItem("tempatku_login");
    console.log("params : ", params);
    const [checkIn, setCheckIn] = useState(location?.state?.inputCheckIn);
    const [checkOut, setCheckOut] = useState(location?.state?.inputCheckOut);
    const [price, setPrice] = useState(location?.state?.priceRoom);
    const [selectedPayment, setSelectedPayment] = useState("");
    console.log("payment method : ", selectedPayment);

    const diff = new Date(checkOut) - new Date(checkIn);
    const days = diff / 86400000;

    const [details, setDetails] = useState([]);
    const [image, setImage] = useState('');
    const getDetails = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/room/payment?uuid=${params.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDetails(get.data[0]);
            setImage(get.data[0].picture_rooms[0].picture)
            console.log("payments get rooms detail transaction", get);
        } catch (error) {
            console.log(error);
        }
    };
    console.log("details", details);

    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const btnConfirm = async () => {
        try {
            if (!selectedPayment || checkIn == "" || checkOut == "") {
                alert("Choose payment and date first!");
            } else {
                setLoadingPage(true);
                let addTransaction = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/transaction/`,
                    {
                        start: checkIn,
                        end: checkOut,
                        price: price,
                        roomId: details.id,
                        email: emailUser,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setLoadingPage(false);
                navigate(`/payment/detail/${addTransaction.data.data1.uuid}`);
            }
        } catch (error) {
            console.log(error);
        }
    };
    let now = new Date();
    now.getTime();
    console.log("nowwwww", now.getTime());

    const [average, setAverage] = useState(0);
    const getAverage = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/review/average?uuid=${params.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("average", get);
            setAverage(get.data.avg_rating);
            setLoadingPage(false)
        } catch (error) {
            console.log(error);
        }
    };
    function RatingProperty(average) {
        return <Rating style={{ maxWidth: 100 }} value={average} readOnly />;
    }

    useEffect(() => {
        getDetails();
        getAverage();
    }, []);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <Box mt="3" px="3">
                <Box>
                    <Flex justifyContent={"center"} mb="5">
                        <Text fontSize={"2xl"} fontWeight="bold">
                            Booking Details
                        </Text>
                    </Flex>

                    {/* PAYMENTS & BOOKING DETAILS */}
                    <Flex
                        gap="10"
                        display={{ base: "block", md: "flex" }}
                        justifyContent="center"
                        mb="20"
                    >
                        {/* PAYMENTS */}
                        <Box w={{ base: "full", md: "50%" }} mb="10">
                            <Text fontSize={"xl"} mb="3">
                                Choose Payments :
                            </Text>
                            <Box my="3">
                                <Image src={CardImage} w="200px" h="30px" />
                            </Box>
                            <RadioGroup onChange={setSelectedPayment}>
                                <Stack display="block">
                                    <Accordion allowToggle defaultIndex={[1]}>
                                        {/* MANUAL PAYMENT */}
                                        <AccordionItem>
                                            <h2>
                                                <AccordionButton>
                                                    <Box
                                                        as="span"
                                                        flex="1"
                                                        textAlign="left"
                                                        fontWeight={"semibold"}
                                                    >
                                                        <Radio value="1">
                                                            Bank Transfer
                                                        </Radio>
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                When making a bank transfer payment, ensure that you provide accurate payment details, including the recipient's account number, bank name, and any additional instructions, to ensure the funds are directed correctly.
                                            </AccordionPanel>
                                        </AccordionItem>

                                        {/* CARD PAYMENT */}
                                        <AccordionItem>
                                            <h2>
                                                <AccordionButton>
                                                    <Box
                                                        as="span"
                                                        flex="1"
                                                        textAlign="left"
                                                        fontWeight={"semibold"}
                                                    >
                                                        <Radio
                                                            value="2"
                                                            isDisabled
                                                        >
                                                            Credit / Debit Card
                                                        </Radio>
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                <Stack spacing={4}>
                                                    <HStack>
                                                        <FormControl id="Name">
                                                            <FormLabel>
                                                                Name
                                                            </FormLabel>
                                                            <Input type="text" />
                                                        </FormControl>
                                                        <FormControl id="email">
                                                            <FormLabel>
                                                                Email address
                                                            </FormLabel>
                                                            <Input type="email" />
                                                        </FormControl>
                                                    </HStack>
                                                    <FormControl id="cardinfo">
                                                        <FormLabel>
                                                            Card Info
                                                        </FormLabel>
                                                        <Input
                                                            type="text"
                                                            placeholder="Card number"
                                                        />
                                                    </FormControl>
                                                    <HStack>
                                                        <FormControl id="expiration">
                                                            <Input
                                                                type="text"
                                                                placeholder="Expiration"
                                                            />
                                                        </FormControl>

                                                        <FormControl id="cvv">
                                                            <Input
                                                                type="text"
                                                                placeholder="CVV"
                                                            />
                                                        </FormControl>
                                                    </HStack>
                                                    <HStack>
                                                        <FormControl id="billing">
                                                            <FormLabel>
                                                                Billing Info
                                                            </FormLabel>
                                                            <Input
                                                                type="text"
                                                                placeholder="ZIP code"
                                                            />
                                                        </FormControl>

                                                        <FormControl id="country">
                                                            <FormLabel>
                                                                Country/region
                                                            </FormLabel>
                                                            <Input type="text" />
                                                        </FormControl>
                                                    </HStack>
                                                    <HStack
                                                        pt={2}
                                                        justifyContent="end"
                                                    >
                                                        <Button
                                                            loadingText="Submitting"
                                                            size="lg"
                                                            bg={"red.500"}
                                                            color={"white"}
                                                            _hover={{
                                                                bg: "blue.500",
                                                            }}
                                                            leftIcon={
                                                                <Icon
                                                                    as={
                                                                        LockIcon
                                                                    }
                                                                />
                                                            }
                                                        >
                                                            Done
                                                        </Button>
                                                        <Button
                                                            loadingText="Submitting"
                                                            size="lg"
                                                            color={"#D3212D"}
                                                            variant="outline"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </HStack>
                                                </Stack>
                                            </AccordionPanel>
                                        </AccordionItem>

                                        {/* DIGITAL PAYMENT */}
                                        <AccordionItem isDisabled="true">
                                            <h2>
                                                <AccordionButton>
                                                    <Box
                                                        as="span"
                                                        flex="1"
                                                        textAlign="left"
                                                        fontWeight={"semibold"}
                                                    >
                                                        <Radio
                                                            value="3"
                                                            isDisabled
                                                        >
                                                            Digital Payment
                                                        </Radio>
                                                    </Box>
                                                    <AccordionIcon />
                                                </AccordionButton>
                                            </h2>
                                            <AccordionPanel pb={4}>
                                                Lorem ipsum dolor sit amet,
                                                consectetur adipiscing elit, sed
                                                do eiusmod tempor incididunt ut
                                                labore et dolore magna aliqua.
                                                Ut enim ad minim veniam, quis
                                                nostrud exercitation ullamco
                                                laboris nisi ut aliquip ex ea
                                                commodo consequat.
                                            </AccordionPanel>
                                        </AccordionItem>
                                    </Accordion>
                                </Stack>
                            </RadioGroup>
                        </Box>

                        {/* CARD PAYMENT DETAIL */}
                        <Box
                            px="5"
                            py="3"
                            border={"1px solid black"}
                            rounded="xl"
                            h="500px"
                        >
                            <Box>
                                <Flex gap="3" my="3" justifyContent={"center"}>
                                    {/* BOX 1 */}
                                    <Box flex="1">
                                        <Image
                                            src={image ? `${process.env.REACT_APP_API_IMG_URL}${image}` : noimage}
                                            w="full"
                                            h="120px"
                                            objectFit={"cover"}
                                        />
                                    </Box>

                                    {/* BOX 2 */}
                                    <Box flex="2">
                                        <Text fontSize={"xl"}>
                                            {details?.property?.property}
                                        </Text>
                                        {/* RATING */}
                                        <Flex my="2">
                                            <Text>
                                                {average === null ? (
                                                    <Text>
                                                        <StarIcon color="yellow.500" />{" "}
                                                        No Rating
                                                    </Text>
                                                ) : (
                                                    RatingProperty(average)
                                                )}
                                            </Text>
                                        </Flex>
                                        <Text
                                            fontSize={"sm"}
                                            fontWeight="light"
                                        >
                                            {details?.property
                                                ?.property_location?.regency
                                                ?.name
                                                ? capitalizeFirstWord(
                                                    details?.property
                                                        ?.property_location
                                                        ?.regency?.name
                                                )
                                                : ""}
                                            , <br />{" "}
                                            {
                                                details?.property
                                                    ?.property_location?.country
                                            }
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>

                            <Box bgColor={"#feefef"} p="3">
                                <Text textAlign={"center"} fontSize="sm">
                                    Book your property before they are all gone.
                                </Text>
                            </Box>

                            {/* BOOKING DATE */}
                            <Box p="3">
                                <Text fontWeight={"semibold"} fontSize="xl">
                                    {details?.room_category?.name}
                                </Text>
                                <Flex justify={"space-between"}>
                                    <Text>
                                        {formatDateIndo(checkIn)} -{" "}
                                        {formatDateIndo(checkOut)}
                                    </Text>
                                    <Text>{days} night</Text>
                                </Flex>
                                <Text>
                                    Price : {formatRupiah(price)} / night
                                </Text>
                            </Box>
                            <hr />

                            {/* CAPACITY */}
                            <Box my="3">
                                <Flex gap="3" alignItems={"center"}>
                                    <Text fontSize={"3xl"}>
                                        <MdPeople />
                                    </Text>
                                    <Text>Max {details?.capacity} adults</Text>
                                </Flex>
                            </Box>
                            <hr />

                            {/* PRICE */}
                            <Box my="3">
                                <Text fontSize={"2xl"}>
                                    Total :{" "}
                                    {formatRupiah(price * parseInt(days))}
                                </Text>
                            </Box>

                            {/* BUTTON */}
                            <Flex
                                justifyContent={"center"}
                                w="full"
                                mt="5"
                                mb="8"
                            >
                                <Button
                                    w="full"
                                    colorScheme={"red"}
                                    onClick={btnConfirm}
                                >
                                    Confirm
                                </Button>
                            </Flex>
                        </Box>
                    </Flex>
                </Box>
            </Box>
        );
    }
}
