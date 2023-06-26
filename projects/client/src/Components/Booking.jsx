import React, { useState } from 'react';
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    HStack,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import { BsStarFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../helper';
import axios from 'axios';
import { useSelector } from "react-redux";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export default function Booking(props) {
    // Get current date
    const currentDate = new Date();
    // Set the minDate prop to the current date to disable yesterday and earlier dates
    const minDate = currentDate;

    console.log("date use location  CI", props.inputCheckIn)
    console.log("date use location CO", props.inputCheckOut)

    return (
        <>
            <Box
                rounded={'lg'}
                p={8}
                maxW={{ sm: '150px', md: '450px' }}
                // overflow='hidden'
                border='1px'
                borderColor={'gray.300'}
            >
                <Stack spacing={4}>
                    <Box display={{ base: 'flex', md: 'flex' }} flexDirection={{ base: 'column', md: 'row' }} justifyContent={'space-between'} >
                        <Box >
                            <FormControl id="checkin">
                                <FormLabel>Check in</FormLabel>
                                <Box border="1px"
                                    borderColor='gray.300'
                                    borderRadius="md"
                                    py="1"
                                    pl='4'
                                    overflow='hidden'
                                    width={{base:'45', sm:"40"}}
                                >
                                    <DatePicker
                                        selected={!props.inputCheckIn ? currentDate : new Date(props.inputCheckIn)}
                                        onChange={(date) => props.setInputCheckIn(new Date(date).toISOString().split('T')[0])}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Choose Date"
                                        minDate={minDate}
                                        shouldCloseOnSelect={false}
                                    />
                                </Box>
                            </FormControl>
                        </Box>
                        <Box pt={{ base: '4', md: '0' }}>
                            <FormControl id="checkout">
                                <FormLabel>Check out</FormLabel>
                                <Box border="1px"
                                    borderColor='gray.300'
                                    borderRadius="md"
                                    py="1" pl='4'
                                    overflow='hidden'
                                    width={{base:'45', sm:"40"}}
                                    >
                                    <DatePicker
                                        selected={!props.inputCheckOut ? new Date(currentDate).getTime() + 24 * 60 * 60 * 1000 : new Date(props.inputCheckOut)}
                                        onChange={(date) => props.setInputCheckOut(new Date(date).toISOString().split('T')[0])}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Choose Date"
                                        minDate={props.inputCheckIn ? new Date(new Date(props.inputCheckIn).getTime() + 24 * 60 * 60 * 1000) : undefined}
                                        shouldCloseOnSelect={false}
                                    />
                                </Box>
                            </FormControl>
                        </Box>
                    </Box>
                    <Button colorScheme={'red'} isLoading={props.loadingButton}>Choose Date</Button>
                    <Stack pt={2}>
                        <Text align={'center'}>
                            You won't be charged yet
                        </Text>
                    </Stack>
                </Stack>
            </Box>
        </>
    )
}