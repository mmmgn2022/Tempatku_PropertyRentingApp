import React, { useState, useEffect } from "react";
import {
    Flex,
    Text,
    Box,
    Heading,
    Link,
    Stack,
    useColorModeValue,
    Input,
    Button,
    FormControl,
    TableContainer,
    Table,
    TableCaption,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Tfoot,
    Menu,
    MenuButton,
    MenuList,
    MenuOptionGroup,
    MenuItemOption,
    MenuDivider,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
} from "@chakra-ui/react";
// import Sidebar from '../../Components/Sidebar/Sidebar'
// import CardOrderListTenant from '../../Components/TenantComponents/CardOrderListTenant'
import axios from "axios";
import { countDays, formatDateIndo, formatRupiah } from "../../helper";
import Sidebar from "../../Components/Sidebar";
import OrderListCardTenant from "../../Components/TenantComponents/OrderListCardTenant";
import { FaFilter } from "react-icons/fa";
import Pagination from "../../Components/Pagination";
import AlertDialogTenant from "../../Components/AlertDialogTenant";
import Loading from "../../Components/Loading";

export default function OrderListTenant() {
    const [loadingPage, setLoadingPage] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    // TOKEN
    let token = localStorage.getItem("tempatku_login");

    // PAGINATION ACTIONS NEEDED
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [sortBy, setSortBy] = useState("id");
    const [order, setOrder] = useState("DESC");
    const [totalData, setTotalData] = useState(0);
    const paginate = (pageNumber) => {
        setPage(pageNumber.selected + 1);
    };

    // DATA FROM getActionsNeeded
    const [actionsNeeded, setActionsNeeded] = useState([]); // all response
    const getActionsNeeded = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/order/actions-needed?page=${page}&size=${size}&sortby=${sortBy}&order=${order}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setActionsNeeded(get.data.rows);
            setTotalData(get.data.count);
        } catch (error) {
            console.log(error);
        }
    };
    console.log("actionsNeeded", actionsNeeded);

    const printCardOrderList = () => {
        return actionsNeeded.map((val, idx) => {
            return (
                <Box p="2" key={idx}>
                    <OrderListCardTenant
                        username={val.transaction.user.user_detail.name}
                        userPicture={
                            val.transaction.user.user_detail.image_profile
                        }
                        createdAtTransaction={val.transaction.createdAt}
                        propertyName={val.room.property.property}
                        roomName={val.room.room_category.name}
                        regency={
                            val.room.property.property_location.regency.name
                        }
                        country={val.room.property.property_location.country}
                        startDate={val.start_date}
                        endDate={val.end_date}
                        roomPrice={val.price}
                        uuidTransaction={val.transaction.uuid}
                        getActionsNeeded={getActionsNeeded}
                        getSummary={getSummary}
                        image_payment={val.transaction.image_payment}
                    />
                </Box>
            );
        });
    };

    // PAGINATION SUMMARY
    const [pageSummary, setPageSummary] = useState(1);
    const [sizeSummary, setSizeSummary] = useState(4);
    const [sortBySummary, setSortBySummary] = useState("id");
    const [orderSummary, setOrderSummary] = useState("DESC");
    const [totalDataSummary, setTotalDataSummary] = useState(0);
    const paginateSummary = (pageNumber) => {
        setPageSummary(pageNumber.selected + 1);
    };

    const [dataSummary, setDataSummary] = useState([]);
    const getSummary = async () => {
        try {
            setLoadingButton(true)
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/order/summary?page=${pageSummary}&size=${sizeSummary}&sortby=${sortBySummary}&order=${orderSummary}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDataSummary(get.data.rows);
            setTotalDataSummary(get.data.count);
            setLoadingPage(false)
            setLoadingButton(false)
            console.log("SUMMARY count", get.data.count);
        } catch (error) {
            console.log(error);
        }
    };
    console.log("SUMMARY", dataSummary);

    const printTableSummary = () => {
        return dataSummary.map((val, idx) => {
            return (
                <Tr key={idx}>
                    <Td>{val.transaction.invoice_number}</Td>
                    <Td>{val.transaction.user?.user_detail?.name}</Td>
                    <Td>{val.room.property.property}</Td>
                    <Td>{val.room.room_category.name}</Td>
                    <Td>{formatDateIndo(val.start_date)}</Td>
                    <Td>{countDays(val.start_date, val.end_date)}</Td>
                    <Td>
                        {formatRupiah(
                            val.price * countDays(val.start_date, val.end_date)
                        )}
                    </Td>
                    <Td>{val.transaction.transaction_status.status}</Td>
                    <Td>
                        {
                            <AlertDialogTenant
                                uuidTransaction={val.transaction.uuid}
                                getActionsNeeded={getActionsNeeded}
                                getSummary={getSummary}
                                status={
                                    val.transaction.transaction_status.status
                                }
                            />
                        }
                    </Td>
                </Tr>
            );
        });
    };

    useEffect(() => {
        getActionsNeeded();
    }, [page, size, sortBy, order]);

    useEffect(() => {
        getSummary();
    }, [pageSummary, sizeSummary, sortBySummary, orderSummary]);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <>
                <Flex
                    minH={"100vh"}
                >
                    {/* Left Content */}
                    <Box>
                        <Sidebar />
                    </Box>
                    {/* Right Content */}
                    <Box w="full" flex="5" px={{ base: "5", sm: "4" }} mt="5">
                        <Heading
                            lineHeight={1.1}
                            mb="5"
                            fontSize={{ base: "2xl", md: "3xl" }}
                            textAlign={{ base: "center", sm: "start" }}
                        >
                            Order List
                        </Heading>
                        {/* Actions Needed */}
                        <Box w="full">
                            <Stack
                                spacing={4}
                                w={"full"}
                                maxW={"90vw"}
                                rounded={"xl"}
                                boxShadow={"lg"}
                                border="1px"
                                borderColor="gray.300"
                                p={6}
                                my={2}
                            >
                                <Heading
                                    lineHeight={1.1}
                                    fontSize={{ base: "2xl", md: "3xl" }}
                                >
                                    Action(s) Needed
                                </Heading>
                                <Flex align={"center"} overflowX={"auto"}>
                                    {/* Client Order List Card */}
                                    {actionsNeeded.length ? (
                                        printCardOrderList()
                                    ) : (
                                        <Text>NO ORDERS</Text>
                                    )}
                                </Flex>
                                <Flex justify={"center"}>
                                    {totalData === 0 ? null : (
                                        <Pagination
                                            size={size}
                                            totalData={totalData}
                                            paginate={paginate}
                                        />
                                    )}
                                </Flex>
                            </Stack>
                        </Box>
                        {/* Summary */}
                        <Box>
                            <Stack
                                spacing={4}
                                w={"full"}
                                maxW={"90vw"}
                                rounded={"xl"}
                                boxShadow={"lg"}
                                border="1px"
                                borderColor="gray.300"
                                p={6}
                                my={2}
                            >
                                <Stack
                                    align={"center"}
                                    justify={"space-between"}
                                    direction={"row"}
                                >
                                    <Heading
                                        lineHeight={1.1}
                                        fontSize={{ base: "2xl", md: "3xl" }}
                                    >
                                        Summary
                                    </Heading>
                                    <Menu closeOnSelect={false}>
                                        <MenuButton
                                            as={Button}
                                            bg={"#D3212D"}
                                            color={"white"}
                                            _hover={{
                                                bg: "#D3212D",
                                            }}
                                            leftIcon={<FaFilter />}
                                            isLoading={loadingButton}
                                        >
                                            Filter
                                        </MenuButton>
                                        <MenuList minWidth="240px">
                                            <MenuOptionGroup
                                                defaultValue="desc"
                                                title="Order"
                                                type="radio"
                                            >
                                                <MenuItemOption
                                                    value="desc"
                                                    onClick={() => {
                                                        setSortBySummary("id");
                                                        setOrderSummary("DESC");
                                                    }}
                                                >
                                                    Newest
                                                </MenuItemOption>
                                                <MenuItemOption
                                                    value="asc"
                                                    onClick={() => {
                                                        setSortBySummary("id");
                                                        setOrderSummary("ASC");
                                                    }}
                                                >
                                                    Oldest
                                                </MenuItemOption>
                                            </MenuOptionGroup>
                                        </MenuList>
                                    </Menu>
                                </Stack>
                                <TableContainer
                                    overflowX={"auto"}
                                    overflowY={"auto"}
                                >
                                    <Table variant="striped">
                                        <Thead>
                                            <Tr>
                                                <Th>Invoice Number</Th>
                                                <Th>User</Th>
                                                <Th>Property</Th>
                                                <Th>Room</Th>
                                                <Th>Start Date</Th>
                                                <Th>Night(s)</Th>
                                                <Th>Price</Th>
                                                <Th>Status</Th>
                                                <Th>Edit</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>{printTableSummary()}</Tbody>
                                    </Table>
                                </TableContainer>
                                <Flex justify={"center"}>
                                    {totalDataSummary === 0 ? null : (
                                        <Pagination
                                            size={sizeSummary}
                                            totalData={totalDataSummary}
                                            paginate={paginateSummary}
                                        />
                                    )}
                                </Flex>
                            </Stack>
                        </Box>
                    </Box>
                </Flex>
            </>
        );
    }
}
