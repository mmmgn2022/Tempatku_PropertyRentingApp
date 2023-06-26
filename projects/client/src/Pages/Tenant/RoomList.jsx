import React, { useEffect, useState } from "react";
import axios from "axios";
import RoomTable from "../../Components/RoomTable";
import {
    Flex,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Box,
    Heading,
    Text,
    Button,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import Sidebar from "../../Components/Sidebar";
import { formatRupiah } from "../../helper/index";
import Loading from "../../Components/Loading";

function RoomList(props) {
    const [loadingPage, setLoadingPage] = useState(true);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const param = useParams();
    const navigate = useNavigate();

    const [dataAllRoom, setDataAllRoom] = useState([]);
    const [name, setName] = useState("");
    const [totalData, setTotalData] = React.useState(0);

    const defaultPage = parseInt(params.get("page")) - 1 || 0;
    const defaultSort = params.get("sortby") || "name";
    const defaultOrder = params.get("orderby") || "ASC";
    const defaultFilter = params.get("filter") || "";
    const [page, setPage] = React.useState(defaultPage);
    const [size] = React.useState(10);
    const [sortby, setSortby] = React.useState(defaultSort);
    const [order, setOrder] = React.useState(defaultOrder);
    const [filter, setFilter] = React.useState(defaultFilter);

    const printRoomData = () => {
        const actualRowNumber = page * size;
        return dataAllRoom.map((val, idx) => {
            const rowNumber = actualRowNumber + idx + 1;
            return (
                <RoomTable
                    key={val.uuid}
                    idx={rowNumber}
                    name={val.room_category.name}
                    capacity={val.capacity}
                    price={formatRupiah(val.price)}
                    uuid={val.uuid}
                    getAllRoomList={getAllRoomList}
                />
            );
        });
    };

    const getAllRoomList = async () => {
        try {
            let token = localStorage.getItem("tempatku_login");
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/room/list?page=${page}&size=${size}&sortby=${name}&order=${order}&name=${filter}&uuid=${param.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDataAllRoom(get.data.data);
            setTotalData(get.data.datanum);
        } catch (error) {
            console.log(error);
        }
    };

    const paginate = (pageNumber) => {
        setPage(pageNumber.selected);
        params.set("page", pageNumber.selected + 1);
    };

    useEffect(() => {
        getAllRoomList();
    }, []);

    useEffect(() => {
        getAllRoomList();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setLoadingPage(false);
        }, 1700);
    }, []);

    if (loadingPage) {
        return <Loading />;
    } else {
        return (
            <>
                <Flex minH={"93vh"} maxW={"100vw"}>
                    <Box>
                        <Sidebar />
                    </Box>
                    <Box
                        w={{ base: "100%", md: "500px", lg: "full" }}
                        flex={"5"}
                        px={{ base: "1", sm: "4" }}
                        mt="5"
                    >
                        <Flex
                            justifyContent={"space-between"}
                            flexDir={{
                                base: "column",
                                md: "column",
                                lg: "row",
                            }}
                        >
                            <Heading
                                lineHeight={1.1}
                                fontSize={{ base: "2xl", md: "3xl" }}
                                textAlign={{ base: "center", sm: "start" }}
                                mb={"5"}
                            >
                                Rooms
                            </Heading>
                            <Box
                                display={"flex"}
                                justifyContent={{
                                    base: "center",
                                    md: "center",
                                }}
                                mb={{ base: "4", md: "4" }}
                            >
                                <Button
                                    color="#D3212D"
                                    variant={"outline"}
                                    w={"150px"}
                                    onClick={() => navigate("/room")}
                                >
                                    New Room
                                </Button>
                            </Box>
                        </Flex>

                        {dataAllRoom.length ? (
                            <>
                                <Box
                                    w={"full"}
                                    h={"82.5vh"}
                                    display={"flex"}
                                    flexDir={"column"}
                                    justifyContent={"space-between"}
                                >
                                    <TableContainer>
                                        <Table
                                            variant="simple"
                                            color={"#EEEEEE"}
                                        >
                                            <Thead>
                                                <Tr>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        No
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Room
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Capacity
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Price
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Controls
                                                    </Th>
                                                </Tr>
                                            </Thead>
                                            {printRoomData()}
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Text>
                                    This Property doesn't have any rooms. Click
                                    "New Room" to add a new room.
                                </Text>
                                <TableContainer>
                                    <Table variant="simple" color={"#EEEEEE"}>
                                        <Thead>
                                            <Tr>
                                                <Th
                                                    fontSize={"lg"}
                                                    textAlign={"center"}
                                                >
                                                    No
                                                </Th>
                                                <Th
                                                    fontSize={"lg"}
                                                    textAlign={"center"}
                                                >
                                                    Room
                                                </Th>
                                                <Th
                                                    fontSize={"lg"}
                                                    textAlign={"center"}
                                                >
                                                    Capacity
                                                </Th>
                                                <Th
                                                    fontSize={"lg"}
                                                    textAlign={"center"}
                                                >
                                                    Price
                                                </Th>
                                                <Th
                                                    fontSize={"lg"}
                                                    textAlign={"center"}
                                                >
                                                    Controls
                                                </Th>
                                            </Tr>
                                        </Thead>
                                        {printRoomData()}
                                    </Table>
                                </TableContainer>
                            </>
                        )}

                        {
                            <Flex justify="center">
                                <Pagination
                                    paginate={paginate}
                                    size={size}
                                    totalData={totalData}
                                />
                            </Flex>
                        }
                    </Box>
                </Flex>
            </>
        );
    }
}

export default RoomList;
