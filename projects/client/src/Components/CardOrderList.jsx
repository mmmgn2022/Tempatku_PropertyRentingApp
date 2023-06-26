import {
    Stack, Text, Button,
    Box,
    Image,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Textarea,
    VStack,

} from "@chakra-ui/react"
import { AiOutlineRight } from "react-icons/ai"
import { FcLock } from 'react-icons/fc';
import { Link } from "react-router-dom";
import noimage from '../assets/noimage.png';
import { formatDateIndo, formatRupiah } from "../helper";
import { Rating } from '@smastrom/react-rating';
import { useState } from "react";
import axios from "axios";

export default function CardOrderList(props) {
    let token = localStorage.getItem("tempatku_login");
    const diff = new Date(props.end_date) - new Date(props.start_date)
    const days = (diff / 86400000);
    const totalPrice = props.price * days


    function validToReview(end_date, status) {
        const today = new Date().getTime();
        const endDate = new Date(end_date).getTime();
        if (endDate < today && status === 'Paid') {
            return true
        } else {
            return false
        }
    }

    console.log("validToReview", validToReview(props.end_date, props.status));


    function ModalReview() {
        const { isOpen, onOpen, onClose } = useDisclosure()
        const [loadingButton, setLoadingButton] = useState(false)
        const btnReview = async () => {
            setLoadingButton(true)
            let review = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/review/`, {
                rating: props.rating,
                review: props.review,
                roomId: props.roomId,
                transactionId: props.transactionId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLoadingButton(false)
            onClose();
            props.getOrderList()
        }
        return (
            <>
                <Button
                    onClick={onOpen}
                    isDisabled={props.isReview ? true : false}
                >
                    Review
                </Button>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Review</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack>
                                <Textarea
                                    placeholder='Write a review'
                                    size='md'
                                    resize='none'
                                    onChange={(e) => props.setReview(e.target.value)}
                                    maxLength={60}
                                />
                                <Flex alignSelf={'start'} py='1'>
                                    <Flex alignItems={'center'}>
                                        <Box >
                                            <Button colorScheme={'red'} variant='outline'
                                                isLoading={loadingButton}
                                                onClick={btnReview}>
                                                Send
                                            </Button>
                                        </Box>
                                        <Box ml='5'>
                                            {props.RatingUser()}
                                        </Box>
                                    </Flex>
                                </Flex>
                            </VStack>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </>
        )
    }
    return (
        <Stack p="4" boxShadow="lg" m="4" borderRadius="sm">
            <Stack direction="row" alignItems="center">
                <Text fontWeight="semibold">
                    Invoice : {props.invoice}
                </Text>
                <FcLock />
            </Stack>
            <Stack
                direction={{ base: 'column', md: 'row' }}
                justifyContent="space-between">
                <Link to={`/payment/detail/${props.uuid}`}>
                    <Box display={{ base: 'block', sm: 'flex' }}>
                        <Image rounded='xl'
                            boxSize={{ base: 'max-content', sm: '200px', lg: '200px' }}
                            src={!props.roomPicture[0] ? noimage : `${process.env.REACT_APP_API_IMG_URL}${props.roomPicture[0].picture}`}
                        />

                        <Text fontSize={{ base: 'sm' }} textAlign={'left'} maxW={'4xl'} px='4'>
                            <Text fontSize={'2xl'} fontWeight='semibold' mt={{ base: '4', sm: '0' }}>
                                {props.property}
                            </Text>
                            <Text mt='4'>
                                <Stack>
                                    <Text fontSize={'md'}>
                                        Max {props.capacity} adults
                                    </Text>
                                    <Text fontSize='md'>
                                        {props.room}
                                    </Text>
                                    <Text fontSize='md'>
                                        {formatDateIndo(props.start_date)} - {formatDateIndo(props.end_date)}
                                    </Text>
                                </Stack>
                                <Text fontSize={{ base: 'xl', sm: '2xl' }} color='orange.400' mt={{ base: '1', sm: '4' }}>
                                    {formatRupiah(totalPrice)}
                                </Text>
                            </Text>
                        </Text>
                    </Box>
                </Link>
                {/* <Box> */}
                {/* </Box> */}
                <Stack direction={{ base: 'column', md: 'row' }} alignItems={{ sm: 'center' }}>
                    <Button variant='solid' colorScheme="green" mt={{ base: '2', sm: '0' }}>
                        Status : {props.status}
                    </Button>
                    {/* KASIH KONDISI KALO BELOM REVIEW JNAGAN MUNCULIN TOMBOL REVIEW */}
                    {/* - jika end date sudah lewat hari ini dan transaction_statusId === 3 tampilkan button review */}
                    {validToReview(props.end_date, props.status) ? ModalReview() : null}
                </Stack>
            </Stack>
        </Stack>
    )
}
