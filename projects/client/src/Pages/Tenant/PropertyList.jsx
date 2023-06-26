import axios from "axios";
import React, { useEffect, useState } from "react";
import PropertyTable from "../../Components/PropertyTable";
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
    Button,
    Text,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import Sidebar from "../../Components/Sidebar";
import { useSelector } from "react-redux";
import Loading from "../../Components/Loading";

function PropertyList(props) {
    const [loadingPage, setLoadingPage] = useState(true);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const navigate = useNavigate();

    const [dataAllProperty, setDataAllProperty] = useState([]);
    const [property, setProperty] = useState("");
    const [totalData, setTotalData] = React.useState(0);

    const defaultPage = parseInt(params.get("page")) - 1 || 0;
    const defaultSort = params.get("sortby") || "property";
    const defaultOrder = params.get("orderby") || "ASC";
    const defaultFilter = params.get("filter") || "";
    const [page, setPage] = React.useState(defaultPage);
    const [size] = React.useState(8);
    const [sortby, setSortby] = React.useState(defaultSort);
    const [order, setOrder] = React.useState(defaultOrder);
    const [filter, setFilter] = React.useState(defaultFilter);

    const printPropertyData = () => {
        const actualRowNumber = page * size;
        return dataAllProperty.map((val, idx) => {
            const rowNumber = actualRowNumber + idx + 1;
            return (
                <PropertyTable
                    key={val.uuid}
                    idx={rowNumber}
                    property={val.property}
                    address={val.property_location.address}
                    uuid={val.uuid}
                    getAllPropertyList={getAllPropertyList}
                />
            );
        });
    };

    const getAllPropertyList = async () => {
        try {
            let token = localStorage.getItem("tempatku_login");
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/property/list/?page=${page}&size=${size}&sortby=${property}&order=${order}&property=${filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setDataAllProperty(get.data.data);
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
        getAllPropertyList();
    }, []);

    useEffect(() => {
        getAllPropertyList();
    }, [sortby, order, page]);

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
                <Flex minH="93vh" maxW={"100vw"}>
                    <Box>
                        <Sidebar />
                    </Box>
                    <Box
                        w={{ base: "100%", md: "500px", lg: "full" }}
                        flex={"5"}
                        px={{ base: "1", md: "4" }}
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
                                Properties
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
                                    mr="4"
                                    color="#D3212D"
                                    variant={"outline"}
                                    onClick={() => navigate("/listing")}
                                    w={"150px"}
                                >
                                    New Property
                                </Button>
                                <Button
                                    mr="4"
                                    color="#D3212D"
                                    variant={"outline"}
                                    w={"150px"}
                                    onClick={() => navigate("/room")}
                                >
                                    New Room
                                </Button>
                            </Box>
                        </Flex>

                        {dataAllProperty.length ? (
                            <>
                                <Box
                                    w={"100%"}
                                    h={"82.5vh"}
                                    display={"flex"}
                                    flexDir={"column"}
                                    justifyContent={"space-between"}
                                >
                                    <TableContainer overflowX={"auto"}>
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
                                                        Property
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Address
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Controls
                                                    </Th>
                                                </Tr>
                                            </Thead>
                                            {printPropertyData()}
                                        </Table>
                                    </TableContainer>
                                    <Flex
                                        justify="center"
                                        align={"center"}
                                        mb={"0"}
                                    >
                                        <Pagination
                                            paginate={paginate}
                                            size={size}
                                            totalData={totalData}
                                        />
                                    </Flex>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Text>
                                    You don't have any properties. Click "New
                                    Property" to add a new property.
                                </Text>
                                <Box w={"full"} h={"82.5vh"}>
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
                                                        Property
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Address
                                                    </Th>
                                                    <Th
                                                        fontSize={"lg"}
                                                        textAlign={"center"}
                                                    >
                                                        Controls
                                                    </Th>
                                                </Tr>
                                            </Thead>
                                            {printPropertyData()}
                                        </Table>
                                    </TableContainer>
                                    <Flex
                                        justify="center"
                                        align={"center"}
                                        mb={"0"}
                                    >
                                        <Pagination
                                            paginate={paginate}
                                            size={size}
                                            totalData={totalData}
                                        />
                                    </Flex>
                                </Box>
                            </>
                        )}
                    </Box>
                </Flex>
            </>
        );
    }
}

export default PropertyList;
