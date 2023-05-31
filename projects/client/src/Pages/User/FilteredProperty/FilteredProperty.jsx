import {
    Box,
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuOptionGroup,
    Select,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Pagination from "../../../Components/Pagination";
import PropertyCard from "../../../Components/PropertyCard";
import SearchBar from "../../../Components/SearchBar/SearchBar";
import "./FilteredProperty.css"; // import css
import Loading from "../../../Components/Loading"

export default function FilteredProperty() {
    const [loadingPage, setLoadingPage] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    const location = useLocation();
    const token = localStorage.getItem("tempatku_login");
    const [inputLocation, setInputLocation] = useState("");
    const [showLocation, setShowLocation] = useState([]);
    const [inputCheckIn, setInputCheckIn] = useState(
        location?.state?.inputCheckIn
    );
    const [inputCheckOut, setInputCheckOut] = useState(
        location?.state?.inputCheckOut
    );

    console.log("inputCheckIn", inputCheckIn);
    console.log("inputCheckOut", inputCheckOut);

    const onSearch = (searchTerm) => {
        setInputLocation(searchTerm); //if suggestion clicked, it will be put inside the input field
        console.log("Ini adalah search : ", searchTerm);
    };

    const OnBtnCheckIn = () => {
        setInputCheckIn("");
    };

    const OnBtnCheckOut = () => {
        setInputCheckOut("");
    };

    // Get Property and Pagination

    const [showProducts, setShowProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(12);
    const [productName, setProductName] = useState("");
    const [totalData, setTotalData] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("property");
    const [order, setOrder] = useState("ASC");
    const [guest, setGuest] = useState(parseInt(location.state?.guest) || 1);
    const [city, setCity] = useState(location.state?.inputLocation || "");
    const [category, setCategory] = useState(location.state?.category);

    const getAllProperty = async () => {
        try {
            setLoadingButton(true)
            let token = localStorage.getItem("tempatku_login");
            let res = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL
                }/property/available?sortby=${sortBy}&order=${order}&capacity=${guest}&start=${inputCheckIn || ""
                }&end=${inputCheckOut || ""}&name=${productName}&category=${category || ""
                }&city=${city}&size=${size}&page=${page}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("ress dari filter propertyyyy", res);
            setTotalData(res.data.total_data);
            setShowProducts(res.data.data);
            setLoadingPage(false)
            setLoadingButton(false)
        } catch (error) {
            console.log(error);
        }
    };

    console.log("locationnnnn : ", location.state);
    console.log("showww productss : ", showProducts);

    const printAllProperty = () => {
        return showProducts.map((val, idx) => {
            return (
                <PropertyCard
                    property={val.property_name}
                    price={val.property_price}
                    picture={val.picture}
                    uuid={val.uuid}
                    inputCheckIn={inputCheckIn || ""}
                    inputCheckOut={inputCheckOut || ""}
                    location={val.province_name}
                    country={val.country}
                    rating={val.rating}
                />
            );
        });
    };

    const paginate = (pageNumber) => {
        setPage(pageNumber.selected + 1);
        console.log("page : ", pageNumber.selected + 1);
    };

    useEffect(() => {
        getAllProperty();
    }, [page, sortBy, order, category, inputCheckIn, inputCheckOut]);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <Box minH={"100vh"}>
                <Box className="container-fp">
                    <SearchBar
                        setInputLocation={setInputLocation}
                        showLocation={showLocation}
                        inputLocation={inputLocation}
                        inputCheckIn={inputCheckIn}
                        onSearch={onSearch}
                        OnBtnCheckIn={OnBtnCheckIn}
                        OnBtnCheckOut={OnBtnCheckOut}
                        setInputCheckIn={setInputCheckIn}
                        inputCheckOut={inputCheckOut}
                        setInputCheckOut={setInputCheckOut}
                        setPage={setPage}
                        getAllProperty={getAllProperty}
                        setProductName={setProductName}
                        setCity={setCity}
                        stateUseLocation={location.state}
                        setSortBy={setSortBy}
                        setOrder={setOrder}
                        setGuest={setGuest}
                        guest={guest}
                        loadingButton={loadingButton}
                    />
                </Box>
                <Box className="container-fp">
                    <Flex justifyContent={"end"}>
                        <Menu closeOnSelect={false}>
                            <MenuButton as={Button} isLoading={loadingButton}>Filter</MenuButton>
                            <MenuList minWidth="240px">
                                <MenuOptionGroup defaultValue="asc" title="Order">
                                    <MenuItem
                                        value="ASC"
                                        onClick={() => {
                                            setSortBy("property");
                                            setOrder("ASC");
                                        }}
                                    >
                                        A - Z
                                    </MenuItem>
                                    <MenuItem
                                        value="DESC"
                                        onClick={() => {
                                            setSortBy("property");
                                            setOrder("DESC");
                                        }}
                                    >
                                        Z - A
                                    </MenuItem>
                                    <MenuItem
                                        value="DESC"
                                        onClick={() => {
                                            setSortBy("price");
                                            setOrder("ASC");
                                        }}
                                    >
                                        Price Low - High
                                    </MenuItem>
                                    <MenuItem
                                        value="DESC"
                                        onClick={() => {
                                            setSortBy("price");
                                            setOrder("DESC");
                                        }}
                                    >
                                        Price High - Low
                                    </MenuItem>
                                </MenuOptionGroup>
                                <MenuDivider />
                                <MenuOptionGroup title="Category">
                                    <Select
                                        placeholder="Select Category"
                                        variant="unstyled"
                                        pl="9"
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                    >
                                        <option value="Hotel">Hotel</option>
                                        <option value="Apart">Apartemen</option>
                                        <option value="Villa">Villa</option>
                                    </Select>
                                </MenuOptionGroup>
                            </MenuList>
                        </Menu>
                    </Flex>
                    <div className="property-fp">{printAllProperty()}</div>
                </Box>
                <Flex justify={"center"}>
                    <Pagination
                        size={size}
                        totalData={totalData}
                        paginate={paginate}
                    />
                </Flex>
            </Box>
        );
    }
}
