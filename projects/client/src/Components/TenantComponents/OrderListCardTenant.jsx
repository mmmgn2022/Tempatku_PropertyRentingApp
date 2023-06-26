import {
    Heading,
    Avatar,
    Box,
    Center,
    Text,
    Stack,
    Button,
    Link,
    Badge,
    useColorModeValue,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Image,
} from "@chakra-ui/react";
import React from "react";
import { capitalizeFirstWord, formatRupiah } from "../../helper";
import axios from "axios";
import { useState } from "react";

export default function OrderListCardTenant(props) {
    const [loadingButton, setLoadingButton] = useState(false)
    let token = localStorage.getItem("tempatku_login");
    const diff = new Date(props.endDate) - new Date(props.startDate);
    const days = diff / 86400000;

    const updateTransactionStatus = async () => {
        try {
            setLoadingButton(true)
            let update = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/transaction/confirm`,
                {
                    transaction_statusId: 3,
                    uuid: props.uuidTransaction,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            props.getActionsNeeded();
            props.getSummary();
            setLoadingButton(false)
        } catch (error) {
            console.log(error);
        }
    };

    const rejectTransaction = async () => {
        try {
            setLoadingButton(true)
            let update = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/transaction/reject`,
                {
                    uuid: props.uuidTransaction,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            props.getActionsNeeded();
            props.getSummary();
            setLoadingButton(false)
        } catch (error) {
            console.log(error);
        }

    };

    // ALERT DIALOG BUTTON CONFIRM
    function AlertDialogButtonConfirm() {
        const { isOpen, onOpen, onClose } = useDisclosure();
        const cancelRef = React.useRef();
        const handleConfirm = () => {
            updateTransactionStatus();
            props.getActionsNeeded();
            props.getSummary();
            onClose();
        };
        return (
            <>
                <Button
                    onClick={onOpen}
                    fontSize={"sm"}
                    rounded={"full"}
                    bg={"#D3212D"}
                    color={"white"}
                    _hover={{
                        bg: "#D3212D",
                    }}
                    _focus={{
                        bg: "#D3212D",
                    }}
                    isLoading={loadingButton}
                >
                    Confirm Order
                </Button>

                <AlertDialog
                    isOpen={isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Confirm Order
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                Are you sure? You can't undo this action
                                afterwards.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={handleConfirm}
                                    ml={3}
                                    isLoading={loadingButton}

                                >
                                    Confirm
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </>
        );
    }

    //MODAL CHECK DETAILS
    function ModalCheckDetails() {
        const { isOpen, onOpen, onClose } = useDisclosure();
        const handleReject = () => {
            rejectTransaction();
            props.getActionsNeeded();
            props.getSummary();
            onClose();
        };
        return (
            <>
                <Button
                    onClick={onOpen}
                    fontSize={"sm"}
                    rounded={"full"}
                    _focus={{
                        bg: "gray.200",
                    }}
                    variant="outline"
                    isLoading={loadingButton}
                >
                    Check Details
                </Button>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Image
                                src={`${process.env.REACT_APP_API_IMG_URL}${props.image_payment}`}
                                w="full"
                                h="full"
                            />
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                variant="outline"
                                colorScheme="red"
                                mr={3}
                                onClick={onClose}
                            >
                                Close
                            </Button>
                            <Button
                                variant="solid"
                                colorScheme="red"
                                isLoading={loadingButton}
                                onClick={handleReject}
                            >
                                Reject Payment
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        );
    }

    return (
        <>
            <Box
                minW={"290px"}
                w={"full"}
                bg={useColorModeValue("white", "gray.900")}
                boxShadow={"sm"}
                rounded={"lg"}
                p={6}
                textAlign={"center"}
                border="1px"
                borderColor="gray.300"
            >
                <Stack
                    align={"center"}
                    justify={"flex-start"}
                    direction={"row"}
                >
                    <Avatar
                        size={"lg"}
                        src={
                            props.userPicture == null ? "https://ionicframework.com/docs/img/demos/avatar.svg" : props.userPicture && props.userPicture.includes('http') ? props.userPicture : `${process.env.REACT_APP_API_IMG_URL}${props.userPicture}` ? `${process.env.REACT_APP_API_IMG_URL}${props.userPicture}` : "https://ionicframework.com/docs/img/demos/avatar.svg"
                        }
                        alt={"Avatar Alt"}
                        mb={0}
                        pos={"relative"}
                    />
                    <Box textAlign={"start"}>
                        <Text fontWeight={400} color={"black"}>
                            {props.username}
                        </Text>
                        <Text fontWeight={400} color={"black"}>
                            {new Date(
                                props.createdAtTransaction
                            ).toLocaleString("id-ID")}
                        </Text>
                    </Box>
                </Stack>
                <Stack
                    align={"space-between"}
                    justify={"center"}
                    direction={"column"}
                    mt={6}
                >
                    <Stack align={"flex-start"} direction={"column"}>
                        <Text>{props.propertyName}</Text>
                        <Text>{props.roomName}</Text>
                    </Stack>
                    <Stack
                        align={"center"}
                        justify={"space-between"}
                        direction={"row"}
                    >
                        <Text textAlign={"start"}>
                            {capitalizeFirstWord(props.regency)}
                        </Text>
                        <Text>{props.country}</Text>
                    </Stack>
                    <Stack
                        align={"center"}
                        justify={"space-between"}
                        direction={"row"}
                    >
                        <Text>Start Date</Text>
                        <Text>
                            {new Date(props.startDate).toLocaleDateString(
                                "id-ID"
                            )}
                        </Text>
                    </Stack>
                    <Stack
                        align={"center"}
                        justify={"space-between"}
                        direction={"row"}
                    >
                        <Text>Night(s)</Text>
                        <Text>{days}</Text>
                    </Stack>
                    <Stack
                        align={"center"}
                        justify={"space-between"}
                        direction={"row"}
                    >
                        <Text>Total</Text>
                        <Text>{formatRupiah(props.roomPrice * days)}</Text>
                    </Stack>
                    s
                </Stack>

                <Stack mt={4} direction={"row"}>
                    {/* BUTTON CHECK DETAILS */}
                    {ModalCheckDetails()}
                    {/* BUTTON CONFIRM */}
                    {AlertDialogButtonConfirm()}
                </Stack>
            </Box>
        </>
    );
}
