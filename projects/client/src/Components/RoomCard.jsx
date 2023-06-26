import {
    Box, Button, useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Flex,
    Text,
    Image,
    ModalOverlay,
    ModalFooter,
    useToast,
    Center,
    HStack,
} from "@chakra-ui/react";
import React from 'react';
import Swiper from "swiper";
import SwiperCarousel from "../Components/SwiperCarousel/SwiperCarousel";
import noimage from '../assets/noimage.png';
import { Link } from "react-router-dom";
import { StarIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from "react-redux";
import { FcGallery } from 'react-icons/fc';


export default function RoomCard(props) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const navigate = useNavigate();
    const isVerified = useSelector((state) => state.authReducer.isVerified);
    const [loading, setLoading] = React.useState(false);
    const toast = useToast();
    const role = useSelector((state) => state.authReducer.role);
    const [isBookingModalOpen, setBookingModalOpen] = React.useState(false);
    console.log("ini isi user is Verified ? :", isVerified);
    console.log("ini isi user role ? :", role);

    //inside modal alert cannot continue to transaction page
    const onBtnSendVerifyEmail = async () => {
        try {
            setLoading(true);
            let token = localStorage.getItem("tempatku_login");
            let response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/send-verification-email`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            );
            toast({
                title: response.data.message,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
            console.log("ini error dari onBtnSendVerifyEmail :", error);
            if (error.response && error.response.status === 401) {
                toast({
                    title: 'Your code has expired. Please log in again to resend email to verify your account.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: error.response.data.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Box cursor='pointer'>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    py={{ base: '4', sm: '30' }}
                    borderBottom="1px solid #ccc"
                    maxHeight={'xl'}
                >
                    <Box flexBasis={{ base: "100%", md: "40%" }}>
                        <Flex
                            borderRadius="12px"
                            w={{ base: '100%', lg: "100%" }}
                            h="100%"
                            align="center"
                            justify="center"
                            position="relative"
                            onClick={onOpen}
                            zIndex={1}
                            maxW={{ base: '350px', md: '330px', lg: '330px' }}
                            maxH={{ base: '150px', md: '200px', lg: '200px' }}
                        >
                            <Image
                                src={!props.picture?.length ? noimage : `${process.env.REACT_APP_API_IMG_URL}${props?.picture[0].picture}`}
                                alt="Your Image"
                                w="full"
                                h='full'
                                objectFit="cover"
                                borderRadius="12px"
                            />
                            <Box
                                position="absolute"
                                top="8%"
                                right="0%"
                                transform="translate(-50%, -50%)"
                                onClick={() => {
                                    setBookingModalOpen(false);
                                    onOpen();
                                }}
                            >
                                <FcGallery size={30} />
                            </Box>
                        </Flex>
                    </Box>
                    <Box
                        flexBasis={{ base: '100%', md: '58%' }}
                    >
                        <Text
                            fontWeight={600}
                            fontSize={{ base: '18px', lg: '22px' }}
                            mt={{ base: '4', sm: '0' }}
                        >
                            {props?.name}
                        </Text>
                        <Text fontSize={{ base: "14px", sm: "16px" }}>
                            {props?.description}
                        </Text>
                        <Box textAlign="right">
                            <Text>{props?.capacity} Guest</Text>
                            <Flex alignItems={"right"} justifyContent="flex-end">
                                <Text fontSize={{ base: "14px", sm: "16px" }}>{Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(props?.price || 0)}</Text>
                                <Text fontSize={{ base: "14px", sm: "16px" }} fontWeight="500">&nbsp;/ day</Text>
                            </Flex>
                            <br />
                            {/* BOOKING BUTTON START */}
                            {
                                // User
                                role == "User" ? (
                                    //if user isverified false
                                    !isVerified ? (
                                        <>
                                            <Button
                                                loadingText="Submitting"
                                                bg={'#D3212D'}
                                                color={'white'}
                                                _hover={{
                                                    bg: '#D3212D',
                                                }}
                                                type='button'
                                                onClick={() => setBookingModalOpen(true)}
                                            >
                                                Book now
                                            </Button>
                                            <Modal
                                                onClose={() => setBookingModalOpen(false)}
                                                isOpen={isBookingModalOpen}
                                                isCentered>
                                                <ModalOverlay />
                                                <ModalContent>
                                                    <ModalHeader>Please verify your account!</ModalHeader>
                                                    <ModalCloseButton />
                                                    <ModalBody>
                                                        <p>You need to verify your email address before you can make a booking.
                                                            Click the button below an we will send you an email to verify your account</p>
                                                        <br />
                                                        <Button
                                                            bg={'#D3212D'}
                                                            color={'white'}
                                                            _hover={{
                                                                bg: '#D3212D',
                                                            }}
                                                            type='button'
                                                            onClick={onBtnSendVerifyEmail}
                                                            isLoading={loading}
                                                            w='full'
                                                        >
                                                            Send Verification Email
                                                        </Button>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button onClick={() => setBookingModalOpen(false)}>Cancel</Button>
                                                    </ModalFooter>
                                                </ModalContent>
                                            </Modal>
                                        </>
                                    )
                                        :
                                        (
                                            //if User isVerified true
                                            <>
                                                <Link to={`/payment/${props.uuid}`} state={{ inputCheckIn: props.inputCheckIn, inputCheckOut: props.inputCheckOut, priceRoom: props.price }}>
                                                    <Button
                                                        loadingText="Submitting"
                                                        bg={'#D3212D'}
                                                        color={'white'}
                                                        _hover={{
                                                            bg: 'red.500',
                                                        }}
                                                        type='button'
                                                    >
                                                        Book now
                                                    </Button>
                                                </Link>
                                            </>
                                        ))
                                    :
                                    // if not user
                                    (
                                        <>
                                            <Button
                                                loadingText="Submitting"
                                                bg={'#D3212D'}
                                                color={'white'}
                                                _hover={{
                                                    bg: 'red.500',
                                                }}
                                                type='button'
                                                onClick={() => setBookingModalOpen(true)}
                                            >
                                                Book now
                                            </Button>
                                            <Modal
                                                onClose={() => setBookingModalOpen(false)}
                                                isOpen={isBookingModalOpen}
                                                isCentered>
                                                <ModalOverlay />
                                                <ModalContent>
                                                    <ModalHeader>Please login to continue</ModalHeader>
                                                    <ModalCloseButton />
                                                    <ModalBody>
                                                        <p>Please login to your account and continue with your booking.</p>
                                                        <br />
                                                        <Center>
                                                            <Button
                                                                bg={'#D3212D'}
                                                                color={'white'}
                                                                _hover={{
                                                                    bg: 'red.500',
                                                                }}
                                                                type='button'
                                                                onClick={() => navigate('/')}
                                                                w='full'
                                                                mb='2'
                                                            >
                                                                Return to Homepage
                                                            </Button>
                                                        </Center>
                                                        <Center>
                                                            <HStack fontSize='sm' spacing='1'>
                                                                <Text>New to tempatku?</Text>
                                                                <Text onClick={() => navigate('/register/user')} color='#0969da'
                                                                    cursor={'pointer'}
                                                                >
                                                                    Create an account.
                                                                </Text>
                                                            </HStack>
                                                        </Center>
                                                    </ModalBody>
                                                    <ModalFooter>
                                                        <Button onClick={() => setBookingModalOpen(false)}>Cancel</Button>
                                                    </ModalFooter>
                                                </ModalContent>
                                            </Modal>
                                        </>
                                    )
                            }
                            {/* BOOKING BUTTON END */}
                        </Box>
                    </Box>
                </Box>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalContent maxH="700px" maxW="700px">
                        <ModalHeader>Picture Room</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Box>
                                <SwiperCarousel pictureRoom={props.picture} />
                            </Box>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Box >
        </>
    )
}