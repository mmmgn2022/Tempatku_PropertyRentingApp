import {
    Box,
    Flex,
    Text,
    Button,
    Input,
    Stack,
    List,
    ListItem,
    ListIcon,
    useColorModeValue,
    Icon,
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import Countdown, { zeroPad } from "react-countdown";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { MdContentCopy } from "react-icons/md";
import BookingDetails from "../../Components/BookingDetails";
import { formatRupiah } from "../../helper";
import noimage from "../../assets/noimage.png"
import Loading from "../../Components/Loading";

export default function PaymentDetail() {
    const [loadingPage, setLoadingPage] = useState(true)
    const params = useParams();
    let token = localStorage.getItem("tempatku_login");
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    // const [data, setData] = useState([])
    const [expiredAt, setExpiredAt] = useState("");
    const [createdAt, setCreatedAt] = useState(null);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [price, setPrice] = useState(0);
    const [bank, setBank] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState("");
    const [customer, setCustomer] = useState("");
    const [roomName, setRoomName] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");
    const [propertyRegency, setPropertyRegency] = useState("");
    const [propertyCountry, setPropertyCountry] = useState("");
    const getTransactionTimeAndBank = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/transaction/detail?uuid=${params.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("get time bank", get);
            setExpiredAt(get.data.timeAndPrice[0].expiredAt);
            setRoomName(get.data.timeAndPrice[0].orders[0].room.room_category.name);
            setCustomer(get.data.timeAndPrice[0].user.user_detail.name);
            setCreatedAt(get.data.timeAndPrice[0].createdAt);
            setInvoiceNumber(get.data.timeAndPrice[0].invoice_number);
            setStartDate(get.data.timeAndPrice[0].orders[0].start_date);
            setEndDate(get.data.timeAndPrice[0].orders[0].end_date);
            setPrice(get.data.timeAndPrice[0].orders[0].price);
            setBank(get.data.bank[0].user_detail);
            setTransactionStatus(
                get.data.timeAndPrice[0].transaction_status.status
            );

            let getOther = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/room/payment?uuid=${get.data.timeAndPrice[0].orders[0].room.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("get other detail", getOther);
            setPropertyName(getOther.data[0].property.property);
            setPropertyAddress(getOther.data[0].property.property_location.address);
            setPropertyRegency(
                getOther.data[0].property.property_location.regency.name
            );
            setPropertyCountry(getOther.data[0].property.property_location.country);
            setLoadingPage(false);
        } catch (error) {
            console.log(error);
        }
    };

    // CANCEL BUTTON
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef();
    const [statusId, setStatusId] = useState(5);
    const cancelOrReject = async (req, res, next) => {
        try {
            setIsLoadingButton(true);
            let update = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/transaction/status`,
                {
                    transaction_statusId: statusId,
                    uuid: params.uuid,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setIsLoadingButton(false);
            getTransactionTimeAndBank();
        } catch (error) {
            console.log(error);
        }
    };

    // FIND TOTAL DAYS
    const diff = new Date(endDate) - new Date(startDate);
    const days = diff / 86400000;

    // ADD 2 HOUR FOR COUNTDOWN
    const addTwoHours = new Date(createdAt).getTime() + 7200000;

    // COUNTDOWN
    const [countStop, setCountStop] = useState(true);
    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            if (countStop) {
                getTransactionTimeAndBank();
                setCountStop(false);
            }
            console.log("transactionStatus", transactionStatus);
            if (transactionStatus === "Waiting for payment") {
                // cancelOrReject();
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Transaction time has expired!
                            </Text>
                            <Text fontSize={{ base: "sm" }}>
                                {
                                    new Date(addTwoHours)
                                        .toString("en-US", {
                                            timeZone: "Asia/Jakarta",
                                        })
                                        .split("G")[0]
                                }
                            </Text>
                        </Stack>
                    </Stack>
                );
            } else if (transactionStatus === "Paid") {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Payment confirm by tenant
                            </Text>
                        </Stack>
                    </Stack>
                );
            } else if (transactionStatus === "Waiting for confirmation") {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Waiting for confirmation
                            </Text>
                        </Stack>
                    </Stack>
                );
            } else if (transactionStatus === "Reject") {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Rejected, please upload a new payment image.
                            </Text>
                            <Text fontSize={{ base: "sm" }}>
                                Will expire in :
                            </Text>
                            <Text fontSize={{ base: "sm" }}>
                                {
                                    new Date(expiredAt)
                                        .toString("en-US", {
                                            timeZone: "Asia/Jakarta",
                                        })
                                        .split("G")[0]
                                }
                            </Text>
                        </Stack>
                    </Stack>
                );
            } else {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Canceled
                            </Text>
                        </Stack>
                    </Stack>
                );
            }
        } else {
            if (transactionStatus === "Cancelled") {
                // completed = true
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }}>Cancelled</Text>
                        </Stack>
                    </Stack>
                );
            } else if (transactionStatus === "Waiting for confirmation") {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Waiting for confirmation
                            </Text>
                        </Stack>
                    </Stack>
                );
            } else if (transactionStatus === "Paid") {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Payment confirm by tenant
                            </Text>
                        </Stack>
                    </Stack>
                );
            } else if (transactionStatus === "Reject") {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                Rejected, please upload a new payment image.
                            </Text>
                            <Text fontSize={{ base: "sm" }}>
                                Will expire in :
                            </Text>
                            <Text fontSize={{ base: "sm" }}>
                                {
                                    new Date(expiredAt)
                                        .toString("en-US", {
                                            timeZone: "Asia/Jakarta",
                                        })
                                        .split("G")[0]
                                }
                            </Text>
                        </Stack>
                    </Stack>
                );
            } else {
                return (
                    <Stack textAlign={"center"} p={3} align={"center"}>
                        <Text
                            fontSize={"xs"}
                            fontWeight={500}
                            p={2}
                            px={3}
                            color={"green.500"}
                            rounded={"full"}
                        >
                            Waiting For Your Payment...
                        </Text>
                        <Stack
                            direction={"column"}
                            align={"center"}
                            justify={"center"}
                        >
                            <Text fontSize={{ base: "sm" }}>
                                Will expire in :
                            </Text>
                            <Text fontSize={{ base: "xl" }} fontWeight={800}>
                                {zeroPad(hours, [2])}:{zeroPad(minutes, [2])}:
                                {zeroPad(seconds, [2])}
                            </Text>
                            <Text fontSize={{ base: "sm" }}>
                                {
                                    new Date(addTwoHours)
                                        .toString("en-US", {
                                            timeZone: "Asia/Jakarta",
                                        })
                                        .split("G")[0]
                                }
                            </Text>
                        </Stack>
                    </Stack>
                );
            }
        }
    };
    const CountDownWrapper = () => (
        <Countdown
            date={new Date(createdAt).getTime() + 7200000}
            renderer={renderer}
            zeroPadDays={2}
        />
    );
    const MemoCountDown = React.memo(CountDownWrapper);

    // UPLOAD PAYMENT IMAGE
    const inputImagePayment = useRef();
    const [fileImagePayment, setFileImagePayment] = useState(null);
    const [message, setMessage] = useState("");
    const uploadImagePayment = async (imageFile) => {
        try {
            setIsLoadingButton(true);
            let formData = new FormData();
            formData.append("images", imageFile);

            let add = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/transaction/upload-image-payment/${params.uuid}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (add.data.success) {
                // setFileImagePayment(null);
                setMessage("Image Uploaded");
            }
            getTransactionTimeAndBank();
            setIsLoadingButton(false);
        } catch (error) {
            console.log("upload image payment gagallll", error);
        }
    };
    const onChangeImagePayment = (event) => {
        const maxSize = 1 * 1024 * 1024; // 1MB
        if (event.target.files[0].size > maxSize) {
            alert("You can only upload files that are lower than 1MB in size.");
        } else {
            setFileImagePayment(event.target.files[0]);
            uploadImagePayment(event.target.files[0]);
        }
    };
    // console.log("fileImagePayment", fileImagePayment)

    useEffect(() => {
        getTransactionTimeAndBank();
    }, []);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <Box
                minH={'100vh'}
                align={'center'}
                justify={'center'}
                display={{ base: 'block', lg: 'flex' }} //responsive
                bg={'white'}
                p={{ base: '0', lg: '12' }}
                pt={'12'}
                style={{ justifyContent: 'center', alignItems: 'center' }}
            >

                <Box w='full' display='flex' flexDirection={['column', 'column', 'column', 'row']}>
                    <Box order={[2, 2, 2, 1]} w='full' m='auto'>
                        <BookingDetails invoiceNumber={invoiceNumber} startDate={startDate} endDate={endDate} total={days * price} status={transactionStatus} customer={customer} propertyName={propertyName} propertyAddress={propertyAddress} propertyRegency={propertyRegency} propertyCountry={propertyCountry} roomName={roomName} />
                    </Box>
                    <Box order={[1, 1, 1, 2]} m='auto' mb='0'>
                        <Box
                            maxW={'400px'}
                            w={'full'}
                            bg={'white'}
                            rounded={{ base: 'none', md: 'xl' }}
                            borderWidth={'1px'}
                            borderColor={{ base: 'white', sm: 'gray.300' }}
                            overflow={'hidden'}
                        >
                            <MemoCountDown />
                            <Box borderTop={'1px'} borderColor={{ base: 'white', md: 'gray.300' }}></Box>
                            <Box bg={'white'} px={6} py={6}>
                                <List spacing={{ base: '3', md: '6' }}>
                                    <ListItem>
                                        <Text textAlign="center" fontSize="sm">
                                            Account Name
                                        </Text>
                                        <Text textAlign="center" fontWeight={'600'} fontSize="md" pt='2'>
                                            {bank?.name}
                                        </Text>
                                    </ListItem>
                                    <Box borderTop={'1px'} borderColor={{ base: 'white', md: 'gray.300' }}></Box>
                                    <ListItem>
                                        {/* BUAT USECLIPBOARD UNTUK TOMBOL COPY */}
                                        <Flex alignItems="center" justify={'center'}>
                                            <Box>
                                            </Box>
                                            <Box>
                                                <Box>
                                                    <Text textAlign="center" fontSize="sm">
                                                        Account Number
                                                    </Text>
                                                </Box>
                                                <Box pt='2'>
                                                    <Text textAlign="center" fontWeight={'600'} fontSize="md">
                                                        <ListIcon as={MdContentCopy} color="#D3212D" fontSize={'2xl'} />
                                                        {bank?.account_number}
                                                    </Text>
                                                </Box>
                                            </Box>
                                        </Flex>
                                    </ListItem>
                                    <Box borderTop={'1px'} borderColor={{ base: 'white', md: 'gray.300' }}></Box>
                                    <ListItem>
                                        <Flex alignItems="center" justify={'center'}>
                                            <Box>
                                            </Box>
                                            <Box>
                                                <Box>
                                                    <Text textAlign="center" fontSize="sm">
                                                        Payment Nominal
                                                    </Text>
                                                </Box>
                                                <Box pt='2'>
                                                    <Text textAlign="center" fontWeight={'600'} fontSize="md">
                                                        <ListIcon as={MdContentCopy} color="#D3212D" fontSize={'2xl'} />
                                                        {formatRupiah(days * price)}
                                                    </Text>
                                                </Box>
                                            </Box>
                                        </Flex>
                                    </ListItem>
                                </List>

                                {/* BUAT KONDISI KALO EXPIRED UDAH LEWAT BUTTON NYA ILANG */}
                                <Button
                                    mt={10}
                                    w={'full'}
                                    borderColor="#D3212D"
                                    color={'#D3212D'}
                                    variant={'outline'}
                                    // rounded={'xl'}
                                    isDisabled={transactionStatus === 'Waiting for payment' || transactionStatus === 'Reject' ? false : true}
                                    _hover={{
                                        bg: 'gray.200',
                                    }}
                                    _focus={{
                                        bg: 'gray.200',
                                    }}
                                    leftIcon={<Icon as={FiUpload} fontSize={'xl'} />}
                                    onClick={() => inputImagePayment.current.click()}
                                    isLoading={isLoadingButton}
                                >
                                    <Input type={'file'} display='none' id='file' ref={inputImagePayment}
                                        onChange={onChangeImagePayment} />
                                    {transactionStatus !== 'Waiting for payment' || fileImagePayment ? 'Image Uploaded' : 'Upload Payment Receipt'}
                                </Button>

                                <Link to='/order/list'>
                                    <Button
                                        mt={2}
                                        w={'full'}
                                        bg={'white'}
                                        borderColor="red.500"
                                        color={'red.500'}
                                        variant={'outline'}
                                        // rounded={'xl'}
                                        _hover={{
                                            bg: 'gray.200',
                                        }}
                                        _focus={{
                                            bg: 'gray.200',
                                        }}
                                        leftIcon={<Icon as={AiOutlineEye} fontSize={'xl'} />}
                                        isLoading={isLoadingButton}
                                    >
                                        See your order list
                                    </Button>
                                </Link>
                                {/* CANCEL ORDER BUTTON SEMENTARA */}
                                <Button
                                    onClick={onOpen}
                                    isDisabled={transactionStatus !== 'Waiting for payment' || fileImagePayment ? true : false}
                                    mt={2}
                                    w={'full'}
                                    bg={'red.400'}
                                    color={'white'}
                                    _hover={{
                                        bg: 'red.500',
                                    }}
                                    _focus={{
                                        bg: 'red.500',
                                    }}
                                    isLoading={isLoadingButton}
                                >
                                    Cancel Order
                                </Button>

                                <AlertDialog
                                    isOpen={isOpen}
                                    leastDestructiveRef={cancelRef}
                                    onClose={onClose}
                                >
                                    <AlertDialogOverlay>
                                        <AlertDialogContent>
                                            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                                Cancel Order
                                            </AlertDialogHeader>

                                            <AlertDialogBody>
                                                Are you sure? You can't undo this action afterwards.
                                            </AlertDialogBody>

                                            <AlertDialogFooter>
                                                <Button ref={cancelRef} onClick={onClose}>
                                                    Cancel
                                                </Button>
                                                <Button colorScheme='red' ml={3}
                                                    onClick={() => {
                                                        cancelOrReject();
                                                        // setCompletedCountdown(true)
                                                        getTransactionTimeAndBank();
                                                        onClose();
                                                    }}
                                                >
                                                    Save
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialogOverlay>
                                </AlertDialog>
                            </Box>
                        </Box>
                    </Box>
                </Box>

            </Box >
        );
    }
}
