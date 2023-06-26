import {
    Box,
    Button,
    Container,
    Flex,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuOptionGroup,
    MenuItem,
    MenuDivider,
    Select,
    Image,
    Stack,
    Input,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { AiOutlineRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import CardOrderList from "../../Components/CardOrderList";
import Pagination from "../../Components/Pagination";
import { Rating } from "@smastrom/react-rating";
import Loading from "../../Components/Loading";

export default function OrderLists() {
    const [loadingPage, setLoadingPage] = useState(false)
    let token = localStorage.getItem("tempatku_login");

    // PAGINATION
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [transactionStatusId, setTransactionStatusId] = useState("");
    const [invoice, setInvoice] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [order, setOrder] = useState("DESC");
    const [start, setStart] = useState("2000-01-01");
    const [end, setEnd] = useState("2030-01-01");
    const [totalData, setTotalData] = useState(0);

    const paginate = (pageNumber) => {
        setPage(pageNumber.selected + 1);
        console.log(pageNumber.selected + 1);
    };

    const [orderList, setOrderList] = useState([]);
    const [loadingButton, setLoadingButton] = useState(false);
    const getOrderList = async () => {
        try {
            setLoadingButton(true)
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/order?page=${page}&size=${size}&status=${transactionStatusId}&invoice=${invoice}&sortby=${sortBy}&order=${order}&start=${start}&end=${end}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("gett order listt", get);
            setOrderList(get.data.data);
            setTotalData(get.data.datanum);
            setLoadingButton(false)
            setLoadingPage(false)
        } catch (error) {
            console.log(error);
        }
    };
    console.log("order list", orderList.rows);

    function getRating(rating) {
        switch (rating) {
            case 1:
                return "Poor";
            case 2:
                return "Nothing special";
            case 3:
                return "Average";
            case 4:
                return "Very good";
            case 5:
                return "Excellent";
            default:
                return "None";
        }
    }

    const [rating, setRating] = useState(5);
    const [review, setReview] = useState(" ");
    function RatingUser() {
        const [hoveredRating, setHoveredRating] = useState(0);

        return (
            <Flex
                style={{ maxWidth: 200, width: "100%" }}
                gap="5"
                alignItems="center"
            >
                <Box w="60%">
                    <Rating
                        value={rating}
                        onChange={setRating}
                        onHoverChange={setHoveredRating}
                    />
                </Box>
                <Box w={"40%"}>
                    <Text fontSize={"sm"}>{`${getRating(rating)}`}</Text>
                </Box>
            </Flex>
        );
    }

    const printOrderList = () => {
        return orderList?.rows?.map((val, idx) => {
            return (
                <CardOrderList
                    property={val.room.property.property}
                    capacity={val.room.capacity}
                    room={val.room.room_category.name}
                    price={val.price}
                    end_date={val.end_date}
                    start_date={val.start_date}
                    status={val.transaction.transaction_status.status}
                    invoice={val.transaction.invoice_number}
                    roomPicture={val.room.picture_rooms}
                    uuid={val.transaction.uuid}
                    RatingUser={RatingUser}
                    review={review}
                    setReview={setReview}
                    roomId={val.room.id}
                    rating={rating}
                    transactionId={val.transaction.id}
                    isReview={val.transaction.review}
                    getOrderList={getOrderList}
                />
            );
        });
    };

    useEffect(() => {
        getOrderList();
    }, [page, size, sortBy, order, start, end, transactionStatusId]);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <Container maxW={"7xl"}>
                {/* TITLE & FILTER */}
                <Flex display={{ base: 'block', sm: 'flex', md: 'flex' }} justifyContent={"space-between"} alignItems="center" my="5">
                    <Text fontWeight={"bold"} fontSize={"3xl"}>
                        My order
                    </Text>
                    <Flex gap="3">
                        <InputGroup>
                            <Input
                                type="text"
                                placeholder="Invoice"
                                onChange={(e) => setInvoice(e.target.value)}
                            />
                            <InputRightElement width="4.5rem">
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    onClick={getOrderList}
                                    isLoading={loadingButton}
                                >
                                    Find
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <Menu closeOnSelect={false}>
                            <MenuButton as={Button} w="100px" colorScheme="red" isLoading={loadingButton}>
                                <Text>Filter</Text>
                            </MenuButton>
                            <MenuList minWidth="240px">
                                <MenuOptionGroup title="Filter by">
                                    <MenuItem>
                                        <Input
                                            type="date"
                                            onChange={(e) =>
                                                setStart(e.target.value)
                                            }
                                        />
                                        <Input
                                            type="date"
                                            onChange={(e) => setEnd(e.target.value)}
                                        />
                                    </MenuItem>
                                </MenuOptionGroup>
                                <MenuOptionGroup title="Sort by">
                                    <MenuItem
                                        onClick={() => {
                                            setSortBy("start_date");
                                            setOrder("DESC");
                                        }}
                                    >
                                        Last Date
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            setSortBy("start_date");
                                            setOrder("ASC");
                                        }}
                                    >
                                        First Date
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            setSortBy("id");
                                            setOrder("DESC");
                                        }}
                                    >
                                        Last Invoice
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            setSortBy("id");
                                            setOrder("ASC");
                                        }}
                                    >
                                        First Invoice
                                    </MenuItem>
                                </MenuOptionGroup>
                                <MenuDivider />
                                <MenuOptionGroup title="Status">
                                    <Select
                                        placeholder="Select transaction status"
                                        variant="unstyled"
                                        pl="9"
                                        onChange={(e) =>
                                            setTransactionStatusId(e.target.value)
                                        }
                                    >
                                        <option value="1">
                                            Waiting for payment
                                        </option>
                                        <option value="2">
                                            Waiting for confirmation
                                        </option>
                                        <option value="3">Paid</option>
                                        <option value="4">Reject</option>
                                        <option value="5">Canceled</option>
                                    </Select>
                                </MenuOptionGroup>
                            </MenuList>
                        </Menu>
                    </Flex>
                </Flex>

                {/* CARD ORDER LIST */}
                <Flex flexDir={"column"} gap={"3"}>
                    {printOrderList()}
                </Flex>

                {/* PAGINATION */}
                <Flex justifyContent={"center"} mb="20">
                    <Pagination
                        size={size}
                        totalData={totalData}
                        paginate={paginate}
                    />
                </Flex>
            </Container>
        );
    }
}
