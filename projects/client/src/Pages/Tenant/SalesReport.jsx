import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Flex,
    Text,
    CardBody,
    Card,
    Input,
    FormControl,
    Heading,
} from "@chakra-ui/react";
import { Select, useChakraSelectProps } from "chakra-react-select";
import TransactionChart from "../../Components/TransactionChart";
import PropertyChart from "../../Components/PropertyChart";
import UserChart from "../../Components/UserChart";
import Sidebar from "../../Components/Sidebar";
import Loading from "../../Components/Loading";

function SalesReport(props) {
    const [loadingPage, setLoadingPage] = useState(true);
    const today = new Date()
        .toLocaleString("sv", { timeZone: "Asia/Jakarta" })
        .split(" ")[0];

    const tempDate = new Date() - 604800000;
    const weekAgo = new Date(tempDate).toISOString().split("T")[0];

    const [startDateTransaction, setStartDateTransaction] = useState(weekAgo);
    const [endDateTransaction, setEndDateTransaction] = useState(today);

    const [startDateUsers, setStartDateUsers] = useState(weekAgo);
    const [endDateUsers, setEndDateUsers] = useState(today);

    const [startDateProperty, setStartDateProperty] = useState(weekAgo);
    const [endDateProperty, setEndDateProperty] = useState(today);

    const [transactionDataChart, setTransactionDataChart] = useState([]);
    const [userDataChart, setUserDataChart] = useState([]);
    const [propertyDataChart, setPropertyDataChart] = useState([]);

    const [income, setIncome] = useState(0);
    const [users, setUsers] = useState(0);
    const [allProperty, setAllProperty] = useState([]);
    const [property, setProperty] = useState(null);

    let totalincome = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(income);

    let token = localStorage.getItem("tempatku_login");

    const getIncome = async () => {
        try {
            let token = localStorage.getItem("tempatku_login");
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/report/income?start=${startDateTransaction}&end=${endDateTransaction}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIncome(get.data.income);
        } catch (error) {
            console.log(error);
        }
    };

    const getProperty = async () => {
        try {
            let token = localStorage.getItem("tempatku_login");
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/room/property-name-and-id`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAllProperty(get.data);
        } catch (error) {
            console.log(error);
        }
    };

    const propertyOptions = allProperty.map((val, idx) => {
        return { value: val.value, label: val.label };
    });

    const selectProperty = useChakraSelectProps({
        isMulti: false,
        value: property,
        onChange: setProperty,
    });

    const getTransactionChart = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/report/transaction-chart?start=${startDateTransaction}&end=${endDateTransaction}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTransactionDataChart(get.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getPropertyChart = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/report/property-chart/${property.value}?start=${startDateProperty}&end=${endDateProperty}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPropertyDataChart(get.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getUsers = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/report/users?start=${startDateUsers}&end=${endDateUsers}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUsers();
        } catch (error) {
            console.log(error);
        }
    };

    const getUserChart = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/report/user-chart?start=${startDateUsers}&end=${endDateUsers}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUserDataChart(get.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getProperty();
    }, []);

    useEffect(() => {
        getIncome();
        getTransactionChart();
    }, [startDateTransaction, endDateTransaction]);

    useEffect(() => {
        if (property) {
            getPropertyChart();
        }
    }, [startDateProperty, endDateProperty, property]);

    useEffect(() => {
        getUsers();
        getUserChart();
    }, [startDateUsers, endDateUsers]);

    useEffect(() => {
        getUserChart();
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
                <Flex minH={"93vh"}>
                    <Box>
                        <Sidebar />
                    </Box>
                    <Box
                        w="full"
                        flex="5"
                        px={{ base: "1", sm: "4" }}
                        mt="5"
                        pb={"6"}
                    >
                        <Heading
                            lineHeight={1.1}
                            fontSize={{ base: "2xl", md: "3xl" }}
                            textAlign={{ base: "center", sm: "start" }}
                        >
                            Statistics
                        </Heading>
                        <Box
                            display={"flex"}
                            flexDir={{
                                base: "column",
                                md: "column",
                                lg: "row",
                            }}
                            mt="5"
                        >
                            {/* Box 1 */}
                            <Box
                                flex={"3"}
                                display={{
                                    base: "block",
                                    md: "flex",
                                    lg: "flex",
                                }}
                                flexDir="column"
                                justifyContent="center"
                                w={{ base: "100%", md: "100%" }}
                                mb={{ base: "8", md: "8" }}
                            >
                                {/* Transaction */}
                                <Card
                                    borderColor={"gray.300"}
                                    borderWidth={"1px"}
                                    borderRadius="2xl"
                                    maxH={{ md: "5xl" }}
                                    maxW={{ md: "5xl" }}
                                    minH={{
                                        base: "100%",
                                        md: "100%",
                                        lg: "807px",
                                    }}
                                >
                                    <CardBody>
                                        <Box
                                            display={{
                                                base: "block",
                                                md: "flex",
                                                lg: "flex",
                                            }}
                                            justifyContent={{
                                                base: "flex-start",
                                                md: "space-between",
                                                lg: "space-between",
                                            }}
                                            alignItems={{
                                                base: "flex-start",
                                                md: "center",
                                                lg: "center",
                                            }}
                                            flexDir={{
                                                base: "column",
                                                md: "row",
                                                lg: "row",
                                            }}
                                            py={{ base: "1", md: "1", lg: "1" }}
                                        >
                                            <Text
                                                color="#D3212D"
                                                fontSize={{
                                                    base: "3xl",
                                                    md: "4xl",
                                                    lg: "4xl",
                                                }}
                                                fontWeight="extrabold"
                                                w={{
                                                    base: "100%",
                                                    md: "xl",
                                                    lg: "xl",
                                                }}
                                                opacity="inherit"
                                            >
                                                Total Revenue
                                            </Text>
                                        </Box>
                                        <Flex flexDir={"column"}>
                                            <Flex>
                                                <Text
                                                    fontSize={"12px"}
                                                    letterSpacing={"tighter"}
                                                >
                                                    *Choose a date / date range
                                                </Text>
                                            </Flex>
                                            <Flex
                                                ml={{
                                                    base: "0",
                                                    md: "0",
                                                    lg: "0",
                                                }}
                                                my={{
                                                    base: "0",
                                                    md: "4",
                                                    lg: "4",
                                                }}
                                            >
                                                <Box display="flex" my="auto">
                                                    <Input
                                                        type="date"
                                                        mr={{
                                                            base: "4px",
                                                            md: "3",
                                                        }}
                                                        mb={{
                                                            base: "0",
                                                            md: "0",
                                                        }}
                                                        width={{
                                                            base: "100%",
                                                            md: "auto",
                                                        }}
                                                        maxW={{
                                                            base: "155px",
                                                            md: "unset",
                                                        }}
                                                        onChange={(e) =>
                                                            setStartDateTransaction(
                                                                e.target.value
                                                            )
                                                        }
                                                        defaultValue={weekAgo}
                                                        focusBorderColor="#D3212D"
                                                        borderColor="#D3212D"
                                                        borderWidth="2px"
                                                        _placeholder={{
                                                            color: "#D3212D",
                                                        }}
                                                        letterSpacing={
                                                            "tighter"
                                                        }
                                                        fontWeight={"semibold"}
                                                        _hover={""}
                                                    />
                                                    <Input
                                                        type="date"
                                                        ml={{
                                                            base: "4px",
                                                            md: "3",
                                                        }}
                                                        width={{
                                                            base: "100%",
                                                            md: "auto",
                                                        }}
                                                        maxW={{
                                                            base: "155px",
                                                            md: "unset",
                                                        }}
                                                        onChange={(e) =>
                                                            setEndDateTransaction(
                                                                e.target.value
                                                            )
                                                        }
                                                        defaultValue={today}
                                                        focusBorderColor="#D3212D"
                                                        borderColor="#D3212D"
                                                        borderWidth="2px"
                                                        _placeholder={{
                                                            color: "#D3212D",
                                                        }}
                                                        letterSpacing={
                                                            "tighter"
                                                        }
                                                        fontWeight={"semibold"}
                                                        _hover={""}
                                                    />
                                                </Box>
                                            </Flex>
                                        </Flex>

                                        <Box
                                            fontSize={{
                                                base: "3xl",
                                                md: "6xl",
                                                lg: "6xl",
                                            }}
                                            fontWeight="bold"
                                            letterSpacing="tighter"
                                        >
                                            {totalincome}
                                        </Box>
                                        <Box
                                            mt={{ base: "8", md: "4", lg: "4" }}
                                            borderRadius="2xl"
                                        >
                                            <TransactionChart
                                                transactiondatachart={
                                                    transactionDataChart
                                                }
                                                maxH="2xl"
                                            />
                                        </Box>
                                    </CardBody>
                                </Card>
                            </Box>
                            {/* Box 2 */}
                            <Box
                                flex={"1"}
                                display="flex"
                                flexDir={"column"}
                                justifyContent={{
                                    base: "flex-start",
                                    md: "space-between",
                                    lg: "space-between",
                                }}
                                ml={{ base: "0", md: "0" }}
                                minW={{ base: "100%", md: "xl" }}
                            >
                                {/* Property */}
                                <Box
                                    display={{
                                        base: "block",
                                        md: "flex",
                                        lg: "flex",
                                    }}
                                    flexDir="column"
                                    justifyContent="center"
                                    w={{ base: "100%", lg: "md" }}
                                    maxW={{ base: "unset", md: "5xl" }}
                                    mb={{ base: "8", md: "8" }}
                                >
                                    <Card
                                        borderRadius="2xl"
                                        borderColor={"gray.300"}
                                        borderWidth={"1px"}
                                        maxH={{ md: "4xl" }}
                                    >
                                        <CardBody>
                                            <Box
                                                display={{
                                                    base: "block",
                                                    md: "flex",
                                                    lg: "flex",
                                                }}
                                                justifyContent={{
                                                    base: "flex-start",
                                                    md: "space-between",
                                                    lg: "space-between",
                                                }}
                                                alignItems={{
                                                    base: "flex-start",
                                                    md: "center",
                                                    lg: "center",
                                                }}
                                                flexDir={{
                                                    base: "column",
                                                    md: "row",
                                                    lg: "row",
                                                }}
                                            >
                                                <Flex flexDir={"column"}>
                                                    <Text
                                                        color="#D3212D"
                                                        fontSize={{
                                                            base: "3xl",
                                                            md: "4xl",
                                                            lg: "4xl",
                                                        }}
                                                        fontWeight="extrabold"
                                                    >
                                                        Property
                                                    </Text>
                                                    <Flex>
                                                        <Text
                                                            fontSize={"12px"}
                                                            letterSpacing={
                                                                "tighter"
                                                            }
                                                        >
                                                            *Choose a property
                                                        </Text>
                                                    </Flex>
                                                    <Box>
                                                        <FormControl>
                                                            <Select
                                                                useBasicStyles
                                                                name="property"
                                                                options={
                                                                    propertyOptions
                                                                }
                                                                placeholder="Select property"
                                                                closeMenuOnSelect={
                                                                    true
                                                                }
                                                                {...selectProperty}
                                                            />
                                                        </FormControl>
                                                    </Box>
                                                    <Flex>
                                                        <Text
                                                            fontSize={"12px"}
                                                            letterSpacing={
                                                                "tighter"
                                                            }
                                                        >
                                                            *Choose a date /
                                                            date range
                                                        </Text>
                                                    </Flex>
                                                    <Flex
                                                        ml={{
                                                            base: "0",
                                                            md: "auto",
                                                            lg: "auto",
                                                        }}
                                                    >
                                                        <Box
                                                            display="flex"
                                                            my="auto"
                                                        >
                                                            <Input
                                                                type="date"
                                                                mr={{
                                                                    base: "4px",
                                                                    md: "3",
                                                                }}
                                                                mb={{
                                                                    base: "0",
                                                                    md: "0",
                                                                    lg: "0",
                                                                }}
                                                                width={{
                                                                    base: "100%",
                                                                    md: "auto",
                                                                }}
                                                                maxW={{
                                                                    base: "150px",
                                                                    md: "155px",
                                                                    lg: "155px",
                                                                }}
                                                                onChange={(e) =>
                                                                    setStartDateProperty(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                defaultValue={
                                                                    weekAgo
                                                                }
                                                                focusBorderColor="#D3212D"
                                                                borderColor="#D3212D"
                                                                borderWidth="2px"
                                                                _placeholder={{
                                                                    color: "#D3212D",
                                                                }}
                                                                letterSpacing={
                                                                    "tighter"
                                                                }
                                                                fontWeight={
                                                                    "semibold"
                                                                }
                                                                _hover={""}
                                                            />
                                                            <Input
                                                                type="date"
                                                                ml={{
                                                                    base: "4px",
                                                                    md: "2",
                                                                    lg: "2",
                                                                }}
                                                                width={{
                                                                    base: "100%",
                                                                    md: "auto",
                                                                }}
                                                                maxW={{
                                                                    base: "150px",
                                                                    md: "155px",
                                                                    lg: "155px",
                                                                }}
                                                                onChange={(e) =>
                                                                    setEndDateProperty(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                defaultValue={
                                                                    today
                                                                }
                                                                focusBorderColor="#D3212D"
                                                                borderColor="#D3212D"
                                                                borderWidth="2px"
                                                                _placeholder={{
                                                                    color: "#D3212D",
                                                                }}
                                                                letterSpacing={
                                                                    "tighter"
                                                                }
                                                                fontWeight={
                                                                    "semibold"
                                                                }
                                                                _hover={""}
                                                            />
                                                        </Box>
                                                    </Flex>
                                                </Flex>
                                            </Box>

                                            <Box
                                                mt={{
                                                    base: "2",
                                                    md: "2",
                                                    lg: "2",
                                                }}
                                                borderRadius="2xl"
                                            >
                                                <PropertyChart
                                                    propertydatachart={
                                                        propertyDataChart
                                                    }
                                                />
                                            </Box>
                                        </CardBody>
                                    </Card>
                                </Box>
                                {/* Users */}
                                <Box
                                    display={{
                                        base: "block",
                                        md: "flex",
                                        lg: "flex",
                                    }}
                                    flexDir="column"
                                    justifyContent="center"
                                    w={{ base: "100%", lg: "md" }}
                                    maxW={{ base: "unset", md: "5xl" }}
                                >
                                    <Card
                                        borderRadius="2xl"
                                        borderColor={"gray.300"}
                                        borderWidth={"1px"}
                                        maxH={{ md: "4xl" }}
                                    >
                                        <CardBody>
                                            <Box
                                                display={{
                                                    base: "block",
                                                    md: "flex",
                                                    lg: "flex",
                                                }}
                                                justifyContent={{
                                                    base: "flex-start",
                                                    md: "space-between",
                                                    lg: "space-between",
                                                }}
                                                alignItems={{
                                                    base: "flex-start",
                                                    md: "center",
                                                    lg: "center",
                                                }}
                                                flexDir={{
                                                    base: "column",
                                                    md: "row",
                                                    lg: "row",
                                                }}
                                            >
                                                <Flex flexDir={"column"}>
                                                    <Text
                                                        color="#D3212D"
                                                        fontSize={{
                                                            base: "3xl",
                                                            md: "4xl",
                                                            lg: "4xl",
                                                        }}
                                                        fontWeight="extrabold"
                                                    >
                                                        Users
                                                    </Text>
                                                    <Flex>
                                                        <Text
                                                            fontSize={"12px"}
                                                            letterSpacing={
                                                                "tighter"
                                                            }
                                                        >
                                                            *Choose a date /
                                                            date range
                                                        </Text>
                                                    </Flex>
                                                    <Flex
                                                        ml={{
                                                            base: "0",
                                                            md: "auto",
                                                            lg: "auto",
                                                        }}
                                                    >
                                                        <Box
                                                            display="flex"
                                                            my="auto"
                                                        >
                                                            <Input
                                                                type="date"
                                                                mr={{
                                                                    base: "4px",
                                                                    md: "3",
                                                                }}
                                                                mb={{
                                                                    base: "0",
                                                                    md: "0",
                                                                }}
                                                                width={{
                                                                    base: "100%",
                                                                    md: "auto",
                                                                }}
                                                                maxW={{
                                                                    base: "150px",
                                                                    md: "155px",
                                                                    lg: "155px",
                                                                }}
                                                                onChange={(e) =>
                                                                    setStartDateUsers(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                defaultValue={
                                                                    weekAgo
                                                                }
                                                                focusBorderColor="#D3212D"
                                                                borderColor="#D3212D"
                                                                borderWidth="2px"
                                                                _placeholder={{
                                                                    color: "#D3212D",
                                                                }}
                                                                letterSpacing={
                                                                    "tighter"
                                                                }
                                                                fontWeight={
                                                                    "semibold"
                                                                }
                                                                _hover={""}
                                                            />
                                                            <Input
                                                                type="date"
                                                                ml={{
                                                                    base: "4px",
                                                                    md: "2",
                                                                    lg: "2",
                                                                }}
                                                                width={{
                                                                    base: "100%",
                                                                    md: "auto",
                                                                }}
                                                                maxW={{
                                                                    base: "150px",
                                                                    md: "155px",
                                                                    lg: "155px",
                                                                }}
                                                                onChange={(e) =>
                                                                    setEndDateUsers(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                defaultValue={
                                                                    today
                                                                }
                                                                focusBorderColor="#D3212D"
                                                                borderColor="#D3212D"
                                                                borderWidth="2px"
                                                                _placeholder={{
                                                                    color: "#D3212D",
                                                                }}
                                                                letterSpacing={
                                                                    "tighter"
                                                                }
                                                                fontWeight={
                                                                    "semibold"
                                                                }
                                                                _hover={""}
                                                            />
                                                        </Box>
                                                    </Flex>
                                                </Flex>
                                            </Box>

                                            <Box
                                                mt={{
                                                    base: "2",
                                                    md: "2",
                                                    lg: "2",
                                                }}
                                                borderRadius="2xl"
                                            >
                                                <UserChart
                                                    userdatachart={
                                                        userDataChart
                                                    }
                                                />
                                            </Box>
                                        </CardBody>
                                    </Card>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Flex>
            </>
        );
    }
}

export default SalesReport;
