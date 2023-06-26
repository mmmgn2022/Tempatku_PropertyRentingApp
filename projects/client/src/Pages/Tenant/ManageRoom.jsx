import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Container,
    Flex,
    Input,
    InputGroup,
    Text,
    Textarea,
    FormControl,
    FormLabel,
    Image,
    useToast,
} from "@chakra-ui/react";
import { HiTrash } from "react-icons/hi2";
import { SlPicture } from "react-icons/sl";
import { useParams } from "react-router-dom";
import Loading from "../../Components/Loading";

function ManageRoom(props) {
    const [loadingPage, setLoadingPage] = useState(true);
    const params = useParams();

    const toast = useToast();

    const [loading, setLoading] = useState(false);

    const inputFile1 = useRef(null);
    const inputFile2 = useRef(null);
    const inputFile3 = useRef(null);
    const inputFile4 = useRef(null);
    const inputFile5 = useRef(null);

    const [fileRoomEdit1, setFileRoomEdit1] = useState(null);
    const [fileRoomEdit2, setFileRoomEdit2] = useState(null);
    const [fileRoomEdit3, setFileRoomEdit3] = useState(null);
    const [fileRoomEdit4, setFileRoomEdit4] = useState(null);
    const [fileRoomEdit5, setFileRoomEdit5] = useState(null);

    const getRoomData = async () => {
        try {
            let token = localStorage.getItem("tempatku_login");
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/room/data/${params.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setRoomData(get.data.data[0]);
            setFileRoomEdit1(get.data.data[0].picture_rooms[0]);
            setFileRoomEdit2(get.data.data[0].picture_rooms[1]);
            setFileRoomEdit3(get.data.data[0].picture_rooms[2]);
            setFileRoomEdit4(get.data.data[0].picture_rooms[3]);
            setFileRoomEdit5(get.data.data[0].picture_rooms[4]);
        } catch (error) {
            console.log(error);
        }
    };

    const [roomData, setRoomData] = useState(null);
    const [roomName, setRoomName] = useState(roomData?.room_category?.name);
    const [description, setDescription] = useState(roomData?.description);
    const [descriptionLength, setDescriptionLength] = useState(0);
    const [roomCapacity, setRoomCapacity] = useState(roomData?.capacity);
    const [roomPrice, setRoomPrice] = useState(roomData?.price);

    const uploadImageRoom = async (imageFile, id, roomId) => {
        try {
            setLoading(true);
            let token = localStorage.getItem("tempatku_login");
            let formData = new FormData();

            formData.append("images", imageFile);

            let edit = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/room/update-image?id=${id}&roomId=${roomData.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (edit.data.success) {
                toast({
                    title: "Room Image Updated !",
                    description: "Saved your file.",
                    status: "success",
                    duration: 3500,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteImageRoom = async (id) => {
        try {
            setLoading(true);
            let token = localStorage.getItem("tempatku_login");
            let del = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/room/delete-image?id=${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (del.data.success) {
                getRoomData();
                toast({
                    title: " Image Deleted !",
                    description: "Successfully deleted the image.",
                    status: "success",
                    duration: 3500,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const onChangeFile1 = (event, id) => {
        const maxSize = 2 * 1024 * 1024;
        if (event.target.files[0].size > maxSize) {
            toast({
                title: "Error occured",
                description: "Your file is too large",
                status: "error",
                duration: 3500,
                isClosable: true,
            });
        } else {
            setFileRoomEdit1(event.target.files[0]);
            uploadImageRoom(event.target.files[0], id);
        }
    };

    const onChangeFile2 = (event, id) => {
        const maxSize = 2 * 1024 * 1024;
        if (event.target.files[0].size > maxSize) {
            toast({
                title: "Error occured",
                description: "Your file is too large",
                status: "error",
                duration: 3500,
                isClosable: true,
            });
        } else {
            setFileRoomEdit2(event.target.files[0]);
            uploadImageRoom(event.target.files[0], id);
        }
    };

    const onChangeFile3 = (event, id) => {
        const maxSize = 2 * 1024 * 1024;
        if (event.target.files[0].size > maxSize) {
            toast({
                title: "Error occured",
                description: "Your file is too large",
                status: "error",
                duration: 3500,
                isClosable: true,
            });
        } else {
            setFileRoomEdit3(event.target.files[0]);
            uploadImageRoom(event.target.files[0], id);
        }
    };

    const onChangeFile4 = (event, id) => {
        const maxSize = 2 * 1024 * 1024;
        if (event.target.files[0].size > maxSize) {
            toast({
                title: "Error occured",
                description: "Your file is too large",
                status: "error",
                duration: 3500,
                isClosable: true,
            });
        } else {
            setFileRoomEdit4(event.target.files[0]);
            uploadImageRoom(event.target.files[0], id);
        }
    };

    const onChangeFile5 = (event, id) => {
        const maxSize = 2 * 1024 * 1024;
        if (event.target.files[0].size > maxSize) {
            toast({
                title: "Error occured",
                description: "Your file is too large",
                status: "error",
                duration: 3500,
                isClosable: true,
            });
        } else {
            setFileRoomEdit5(event.target.files[0]);
            uploadImageRoom(event.target.files[0], id);
        }
    };

    const btnEditRoom = async () => {
        try {
            setLoading(true);

            let token = localStorage.getItem("tempatku_login");

            let edit = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/room/edit/${params.uuid}`,
                {
                    name: roomName,
                    description: description,
                    capacity: roomCapacity,
                    price: roomPrice,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (edit.data.success) {
                toast({
                    title: "Room Data Updated !",
                    status: "success",
                    duration: 3500,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRoomData();
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
            <Container
                my={"4"}
                h={"100%"}
                w={"100%"}
                maxW={"1300px"}
                display={"flex"}
                flexDir="column"
            >
                <Box
                    border={"1px"}
                    borderColor={"gray.300"}
                    rounded={"3xl"}
                    px={"8"}
                    mb={"10"}
                >
                    <Box
                        textAlign="left"
                        fontSize={{ base: "2xl", md: "5xl", lg: "5xl" }}
                        fontWeight="bold"
                        mt="10"
                    >
                        <h1>Edit Existing Room</h1>
                    </Box>
                    <Box mt={"10"}>
                        <Box
                            textAlign="left"
                            fontSize={{ base: "xl", md: "3xl", lg: "3xl" }}
                            fontWeight="bold"
                        >
                            <h2>Room Information</h2>
                        </Box>
                        <Box fontSize={{ base: "xs", md: "lg" }}>
                            <Box as={Flex} my={"10"}>
                                <Flex
                                    flex={1}
                                    fontWeight={"medium"}
                                    alignItems={"center"}
                                >
                                    <Text>Edit room name</Text>
                                </Flex>
                                <Box flex={3}>
                                    <Box mx="4" my="2">
                                        <InputGroup
                                            display={"flex"}
                                            size={"md"}
                                        >
                                            <Input
                                                isRequired
                                                placeholder="Enter the name of your room"
                                                type="text"
                                                justifyItems={"self-end"}
                                                h={"40px"}
                                                defaultValue={
                                                    roomData?.room_category
                                                        ?.name
                                                }
                                                onChange={(e) =>
                                                    setRoomName(e.target.value)
                                                }
                                            />
                                        </InputGroup>
                                    </Box>
                                </Box>
                            </Box>
                            {/* Upload Photo/s */}
                            <Box as={Flex} my={"10"}>
                                <Flex
                                    flex={1}
                                    fontWeight={"medium"}
                                    alignItems={"center"}
                                >
                                    <Text>Edit Room Photos</Text>
                                </Flex>
                                <Box flex={3}>
                                    <Box
                                        display={"flex"}
                                        flexDir={"column"}
                                        placeItems={"center"}
                                    >
                                        <Box
                                            border={"2px"}
                                            borderStyle={"dashed"}
                                            borderColor={"gray.200"}
                                            borderRadius={"lg"}
                                            mx="4"
                                            my="2"
                                            minW={{
                                                base: "187px",
                                                md: "509px",
                                                lg: "871px",
                                            }}
                                        >
                                            <Box as={Flex}>
                                                <Box
                                                    display={"flex"}
                                                    flexDir={{
                                                        base: "column",
                                                        md: "column",
                                                        lg: "row",
                                                    }}
                                                    w={"full"}
                                                    justifyContent={
                                                        "space-between"
                                                    }
                                                >
                                                    {/* Button Image 1 */}
                                                    {fileRoomEdit1 ? (
                                                        <>
                                                            <Flex
                                                                flexDir={
                                                                    "column"
                                                                }
                                                            >
                                                                <Box
                                                                    onClick={() => {
                                                                        inputFile1.current.click();
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                    align="center"
                                                                >
                                                                    <Image
                                                                        src={
                                                                            typeof fileRoomEdit1.name ==
                                                                            "string"
                                                                                ? URL.createObjectURL(
                                                                                      fileRoomEdit1
                                                                                  )
                                                                                : `${process.env.REACT_APP_API_IMG_URL}${fileRoomEdit1.picture}`
                                                                        }
                                                                        w={
                                                                            "100px"
                                                                        }
                                                                        h={
                                                                            "100px"
                                                                        }
                                                                        my={"4"}
                                                                        mx={"4"}
                                                                        style={{
                                                                            maxWidth:
                                                                                "100px",
                                                                            maxHeight:
                                                                                "100px",
                                                                            aspectRatio:
                                                                                "1/1",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "6px",
                                                                            boxShadow:
                                                                                "2px 2px 5px gray",
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="file"
                                                                        id="file"
                                                                        ref={
                                                                            inputFile1
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "none",
                                                                        }}
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            onChangeFile1(
                                                                                event,
                                                                                fileRoomEdit1?.id
                                                                            );
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Button
                                                                    type="button"
                                                                    h={"35px"}
                                                                    w={"35px"}
                                                                    variant="outline"
                                                                    alignItems={
                                                                        "center"
                                                                    }
                                                                    alignSelf={
                                                                        "center"
                                                                    }
                                                                    mx={"auto"}
                                                                    mb={"4"}
                                                                    onClick={() => {
                                                                        setFileRoomEdit1(
                                                                            null
                                                                        );
                                                                        deleteImageRoom(
                                                                            roomData
                                                                                .picture_rooms[0]
                                                                                .id
                                                                        );
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                >
                                                                    <Text
                                                                        fontSize={
                                                                            "xl"
                                                                        }
                                                                    >
                                                                        <HiTrash
                                                                            fontWeight={
                                                                                "extrabold"
                                                                            }
                                                                            color="#D3212D"
                                                                        />
                                                                    </Text>
                                                                </Button>
                                                            </Flex>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            justifyContent={
                                                                "center"
                                                            }
                                                            display={"flex"}
                                                            flexDir="column"
                                                            size="md"
                                                            w={"100px"}
                                                            h={"100px"}
                                                            textAlign="center"
                                                            my={"4"}
                                                            mx={{
                                                                base: "auto",
                                                                md: "auto",
                                                                lg: "4",
                                                            }}
                                                            variant="outline"
                                                            _hover={""}
                                                            bgColor={"gray.100"}
                                                            alignItems={
                                                                "center"
                                                            }
                                                            onClick={() => {
                                                                inputFile1.current.click();
                                                            }}
                                                            isLoading={loading}
                                                        >
                                                            <SlPicture
                                                                fontSize={
                                                                    "35px"
                                                                }
                                                                color="#D3212D"
                                                            />
                                                            <input
                                                                type="file"
                                                                id="file"
                                                                ref={inputFile1}
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                                onChange={(
                                                                    event
                                                                ) => {
                                                                    onChangeFile1(
                                                                        event,
                                                                        fileRoomEdit1?.id
                                                                    );
                                                                }}
                                                            />
                                                            <Text
                                                                textAlign={
                                                                    "center"
                                                                }
                                                                fontSize={"sm"}
                                                            >
                                                                Choose Image
                                                            </Text>
                                                        </Button>
                                                    )}

                                                    {/* Button Image 2 */}
                                                    {fileRoomEdit2 ? (
                                                        <>
                                                            <Flex
                                                                flexDir={
                                                                    "column"
                                                                }
                                                            >
                                                                <Box
                                                                    onClick={() => {
                                                                        inputFile2.current.click();
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                    align="center"
                                                                >
                                                                    <Image
                                                                        src={
                                                                            typeof fileRoomEdit2.name ==
                                                                            "string"
                                                                                ? URL.createObjectURL(
                                                                                      fileRoomEdit2
                                                                                  )
                                                                                : `${process.env.REACT_APP_API_IMG_URL}${fileRoomEdit2.picture}`
                                                                        }
                                                                        w={
                                                                            "100px"
                                                                        }
                                                                        h={
                                                                            "100px"
                                                                        }
                                                                        my={"4"}
                                                                        mx={"4"}
                                                                        style={{
                                                                            maxWidth:
                                                                                "100px",
                                                                            maxHeight:
                                                                                "100px",
                                                                            aspectRatio:
                                                                                "1/1",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "6px",
                                                                            boxShadow:
                                                                                "2px 2px 5px gray",
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="file"
                                                                        id="file"
                                                                        ref={
                                                                            inputFile2
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "none",
                                                                        }}
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            onChangeFile2(
                                                                                event,
                                                                                fileRoomEdit2?.id
                                                                            );
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Button
                                                                    type="button"
                                                                    h={"35px"}
                                                                    w={"35px"}
                                                                    variant="outline"
                                                                    alignItems={
                                                                        "center"
                                                                    }
                                                                    alignSelf={
                                                                        "center"
                                                                    }
                                                                    mx={"auto"}
                                                                    mb={"4"}
                                                                    onClick={() => {
                                                                        setFileRoomEdit2(
                                                                            null
                                                                        );
                                                                        deleteImageRoom(
                                                                            roomData
                                                                                .picture_rooms[1]
                                                                                .id
                                                                        );
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                >
                                                                    <Text
                                                                        fontSize={
                                                                            "xl"
                                                                        }
                                                                    >
                                                                        <HiTrash
                                                                            fontWeight={
                                                                                "extrabold"
                                                                            }
                                                                            color="#D3212D"
                                                                        />
                                                                    </Text>
                                                                </Button>
                                                            </Flex>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            justifyContent={
                                                                "center"
                                                            }
                                                            display={"flex"}
                                                            flexDir="column"
                                                            size="md"
                                                            w={"100px"}
                                                            h={"100px"}
                                                            textAlign="center"
                                                            my={"4"}
                                                            mx={{
                                                                base: "auto",
                                                                md: "auto",
                                                                lg: "4",
                                                            }}
                                                            variant="outline"
                                                            _hover={""}
                                                            bgColor={"gray.100"}
                                                            alignItems={
                                                                "center"
                                                            }
                                                            onClick={() => {
                                                                inputFile2.current.click();
                                                            }}
                                                            isLoading={loading}
                                                        >
                                                            <SlPicture
                                                                fontSize={
                                                                    "35px"
                                                                }
                                                                color="#D3212D"
                                                            />
                                                            <input
                                                                type="file"
                                                                id="file"
                                                                ref={inputFile2}
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                                onChange={(
                                                                    event
                                                                ) => {
                                                                    onChangeFile2(
                                                                        event,
                                                                        fileRoomEdit2?.id
                                                                    );
                                                                }}
                                                            />
                                                            <Text
                                                                textAlign={
                                                                    "center"
                                                                }
                                                                fontSize={"sm"}
                                                            >
                                                                Choose Image
                                                            </Text>
                                                        </Button>
                                                    )}
                                                    {/* Button Image 3 */}
                                                    {fileRoomEdit3 ? (
                                                        <>
                                                            <Flex
                                                                flexDir={
                                                                    "column"
                                                                }
                                                            >
                                                                <Box
                                                                    onClick={() => {
                                                                        inputFile3.current.click();
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                    align="center"
                                                                >
                                                                    <Image
                                                                        src={
                                                                            typeof fileRoomEdit3.name ==
                                                                            "string"
                                                                                ? URL.createObjectURL(
                                                                                      fileRoomEdit3
                                                                                  )
                                                                                : `${process.env.REACT_APP_API_IMG_URL}${fileRoomEdit3.picture}`
                                                                        }
                                                                        w={
                                                                            "100px"
                                                                        }
                                                                        h={
                                                                            "100px"
                                                                        }
                                                                        my={"4"}
                                                                        mx={"4"}
                                                                        style={{
                                                                            maxWidth:
                                                                                "100px",
                                                                            maxHeight:
                                                                                "100px",
                                                                            aspectRatio:
                                                                                "1/1",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "6px",
                                                                            boxShadow:
                                                                                "2px 2px 5px gray",
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="file"
                                                                        id="file"
                                                                        ref={
                                                                            inputFile3
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "none",
                                                                        }}
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            onChangeFile3(
                                                                                event,
                                                                                fileRoomEdit3?.id
                                                                            );
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Button
                                                                    type="button"
                                                                    h={"35px"}
                                                                    w={"35px"}
                                                                    variant="outline"
                                                                    alignItems={
                                                                        "center"
                                                                    }
                                                                    alignSelf={
                                                                        "center"
                                                                    }
                                                                    mx={"auto"}
                                                                    mb={"4"}
                                                                    onClick={() => {
                                                                        setFileRoomEdit3(
                                                                            null
                                                                        );
                                                                        deleteImageRoom(
                                                                            roomData
                                                                                .picture_rooms[2]
                                                                                .id
                                                                        );
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                >
                                                                    <Text
                                                                        fontSize={
                                                                            "xl"
                                                                        }
                                                                    >
                                                                        <HiTrash
                                                                            fontWeight={
                                                                                "extrabold"
                                                                            }
                                                                            color="#D3212D"
                                                                        />
                                                                    </Text>
                                                                </Button>
                                                            </Flex>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            justifyContent={
                                                                "center"
                                                            }
                                                            display={"flex"}
                                                            flexDir="column"
                                                            size="md"
                                                            w={"100px"}
                                                            h={"100px"}
                                                            textAlign="center"
                                                            my={"4"}
                                                            mx={{
                                                                base: "auto",
                                                                md: "auto",
                                                                lg: "4",
                                                            }}
                                                            variant="outline"
                                                            _hover={""}
                                                            bgColor={"gray.100"}
                                                            alignItems={
                                                                "center"
                                                            }
                                                            onClick={() => {
                                                                inputFile3.current.click();
                                                            }}
                                                            isLoading={loading}
                                                        >
                                                            <SlPicture
                                                                fontSize={
                                                                    "35px"
                                                                }
                                                                color="#D3212D"
                                                            />
                                                            <input
                                                                type="file"
                                                                id="file"
                                                                ref={inputFile3}
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                                onChange={(
                                                                    event
                                                                ) => {
                                                                    onChangeFile3(
                                                                        event,
                                                                        fileRoomEdit3?.id
                                                                    );
                                                                }}
                                                            />
                                                            <Text
                                                                textAlign={
                                                                    "center"
                                                                }
                                                                fontSize={"sm"}
                                                            >
                                                                Choose Image
                                                            </Text>
                                                        </Button>
                                                    )}
                                                    {/* Button Image 4 */}
                                                    {fileRoomEdit4 ? (
                                                        <>
                                                            <Flex
                                                                flexDir={
                                                                    "column"
                                                                }
                                                            >
                                                                <Box
                                                                    onClick={() => {
                                                                        inputFile4.current.click();
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                    align="center"
                                                                >
                                                                    <Image
                                                                        src={
                                                                            typeof fileRoomEdit4.name ==
                                                                            "string"
                                                                                ? URL.createObjectURL(
                                                                                      fileRoomEdit4
                                                                                  )
                                                                                : `${process.env.REACT_APP_API_IMG_URL}${fileRoomEdit4.picture}`
                                                                        }
                                                                        w={
                                                                            "100px"
                                                                        }
                                                                        h={
                                                                            "100px"
                                                                        }
                                                                        my={"4"}
                                                                        mx={"4"}
                                                                        style={{
                                                                            maxWidth:
                                                                                "100px",
                                                                            maxHeight:
                                                                                "100px",
                                                                            aspectRatio:
                                                                                "1/1",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "6px",
                                                                            boxShadow:
                                                                                "2px 2px 5px gray",
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="file"
                                                                        id="file"
                                                                        ref={
                                                                            inputFile4
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "none",
                                                                        }}
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            onChangeFile4(
                                                                                event,
                                                                                fileRoomEdit4?.id
                                                                            );
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Button
                                                                    type="button"
                                                                    h={"35px"}
                                                                    w={"35px"}
                                                                    variant="outline"
                                                                    alignItems={
                                                                        "center"
                                                                    }
                                                                    alignSelf={
                                                                        "center"
                                                                    }
                                                                    mx={"auto"}
                                                                    mb={"4"}
                                                                    onClick={() => {
                                                                        setFileRoomEdit1(
                                                                            null
                                                                        );
                                                                        deleteImageRoom(
                                                                            roomData
                                                                                .picture_rooms[3]
                                                                                .id
                                                                        );
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                >
                                                                    <Text
                                                                        fontSize={
                                                                            "xl"
                                                                        }
                                                                    >
                                                                        <HiTrash
                                                                            fontWeight={
                                                                                "extrabold"
                                                                            }
                                                                            color="#D3212D"
                                                                        />
                                                                    </Text>
                                                                </Button>
                                                            </Flex>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            justifyContent={
                                                                "center"
                                                            }
                                                            display={"flex"}
                                                            flexDir="column"
                                                            size="md"
                                                            w={"100px"}
                                                            h={"100px"}
                                                            textAlign="center"
                                                            my={"4"}
                                                            mx={{
                                                                base: "auto",
                                                                md: "auto",
                                                                lg: "4",
                                                            }}
                                                            variant="outline"
                                                            _hover={""}
                                                            bgColor={"gray.100"}
                                                            alignItems={
                                                                "center"
                                                            }
                                                            onClick={() => {
                                                                inputFile4.current.click();
                                                            }}
                                                            isLoading={loading}
                                                        >
                                                            <SlPicture
                                                                fontSize={
                                                                    "35px"
                                                                }
                                                                color="#D3212D"
                                                            />
                                                            <input
                                                                type="file"
                                                                id="file"
                                                                ref={inputFile4}
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                                onChange={(
                                                                    event
                                                                ) => {
                                                                    onChangeFile4(
                                                                        event,
                                                                        fileRoomEdit4?.id
                                                                    );
                                                                }}
                                                            />
                                                            <Text
                                                                textAlign={
                                                                    "center"
                                                                }
                                                                fontSize={"sm"}
                                                            >
                                                                Choose Image
                                                            </Text>
                                                        </Button>
                                                    )}
                                                    {/* Button Image 5 */}
                                                    {fileRoomEdit5 ? (
                                                        <>
                                                            <Flex
                                                                flexDir={
                                                                    "column"
                                                                }
                                                            >
                                                                <Box
                                                                    onClick={() => {
                                                                        inputFile5.current.click();
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                    align="center"
                                                                >
                                                                    <Image
                                                                        src={
                                                                            typeof fileRoomEdit5.name ==
                                                                            "string"
                                                                                ? URL.createObjectURL(
                                                                                      fileRoomEdit5
                                                                                  )
                                                                                : `${process.env.REACT_APP_API_IMG_URL}${fileRoomEdit5.picture}`
                                                                        }
                                                                        w={
                                                                            "100px"
                                                                        }
                                                                        h={
                                                                            "100px"
                                                                        }
                                                                        my={"4"}
                                                                        mx={"4"}
                                                                        style={{
                                                                            maxWidth:
                                                                                "100px",
                                                                            maxHeight:
                                                                                "100px",
                                                                            aspectRatio:
                                                                                "1/1",
                                                                            objectFit:
                                                                                "cover",
                                                                            borderRadius:
                                                                                "6px",
                                                                            boxShadow:
                                                                                "2px 2px 5px gray",
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="file"
                                                                        id="file"
                                                                        ref={
                                                                            inputFile5
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "none",
                                                                        }}
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            onChangeFile5(
                                                                                event,
                                                                                fileRoomEdit5?.id
                                                                            );
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Button
                                                                    type="button"
                                                                    h={"35px"}
                                                                    w={"35px"}
                                                                    variant="outline"
                                                                    alignItems={
                                                                        "center"
                                                                    }
                                                                    alignSelf={
                                                                        "center"
                                                                    }
                                                                    mx={"auto"}
                                                                    mb={"4"}
                                                                    onClick={() => {
                                                                        setFileRoomEdit5(
                                                                            null
                                                                        );
                                                                        deleteImageRoom(
                                                                            roomData
                                                                                .picture_rooms[4]
                                                                                .id
                                                                        );
                                                                    }}
                                                                    isLoading={
                                                                        loading
                                                                    }
                                                                >
                                                                    <Text
                                                                        fontSize={
                                                                            "xl"
                                                                        }
                                                                    >
                                                                        <HiTrash
                                                                            fontWeight={
                                                                                "extrabold"
                                                                            }
                                                                            color="#D3212D"
                                                                        />
                                                                    </Text>
                                                                </Button>
                                                            </Flex>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            justifyContent={
                                                                "center"
                                                            }
                                                            display={"flex"}
                                                            flexDir="column"
                                                            size="md"
                                                            w={"100px"}
                                                            h={"100px"}
                                                            textAlign="center"
                                                            my={"4"}
                                                            mx={{
                                                                base: "auto",
                                                                md: "auto",
                                                                lg: "4",
                                                            }}
                                                            variant="outline"
                                                            _hover={""}
                                                            bgColor={"gray.100"}
                                                            alignItems={
                                                                "center"
                                                            }
                                                            onClick={() => {
                                                                inputFile5.current.click();
                                                            }}
                                                            isLoading={loading}
                                                        >
                                                            <SlPicture
                                                                fontSize={
                                                                    "35px"
                                                                }
                                                                color="#D3212D"
                                                            />
                                                            <input
                                                                type="file"
                                                                id="file"
                                                                ref={inputFile5}
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                                onChange={(
                                                                    event
                                                                ) => {
                                                                    onChangeFile5(
                                                                        event,
                                                                        fileRoomEdit5?.id
                                                                    );
                                                                }}
                                                            />
                                                            <Text
                                                                textAlign={
                                                                    "center"
                                                                }
                                                                fontSize={"sm"}
                                                            >
                                                                Choose Image
                                                            </Text>
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            {/* Description */}
                            <Box as={Flex} my={"10"}>
                                <Flex
                                    flex={1}
                                    fontWeight={"medium"}
                                    alignItems={"center"}
                                >
                                    <Text>Edit Room Description</Text>
                                </Flex>
                                <Box flex={3}>
                                    <Box mx="4" my="2">
                                        <Textarea
                                            isRequired
                                            placeholder="Enter room description"
                                            size={"md"}
                                            resize={"none"}
                                            h={"250px"}
                                            maxLength={250}
                                            defaultValue={roomData?.description}
                                            onChange={(e) => {
                                                setDescription(e.target.value);
                                                setDescriptionLength(
                                                    e.target.value.length
                                                );
                                            }}
                                        />
                                        <Text
                                            textAlign={"right"}
                                            color={"gray.300"}
                                        >
                                            {descriptionLength}/250
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                            {/* Capacity */}
                            <Box as={Flex} my={"10"}>
                                <Flex
                                    flex={1}
                                    fontWeight={"medium"}
                                    alignItems={"center"}
                                >
                                    <Text>Edit Room Capactiy</Text>
                                </Flex>
                                <Box flex={3}>
                                    <Box mx="4" my="2">
                                        <InputGroup
                                            display={"flex"}
                                            size={"md"}
                                        >
                                            <Input
                                                isRequired
                                                placeholder="Enter room capacity"
                                                type="number"
                                                justifyItems={"self-end"}
                                                h={"40px"}
                                                defaultValue={
                                                    roomData?.capacity
                                                }
                                                onChange={(e) =>
                                                    setRoomCapacity(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </InputGroup>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    {/* Price */}
                    <Box
                        textAlign="left"
                        fontSize={{ base: "xl", md: "3xl", lg: "3xl" }}
                        fontWeight="bold"
                    >
                        <h2>Edit Room Price</h2>
                    </Box>
                    <Box as={Flex} my="10" fontSize={{ base: "xs", md: "lg" }}>
                        <Flex
                            flex={1}
                            fontWeight="medium"
                            alignItems={"center"}
                        >
                            Set Your Price
                        </Flex>
                        <Box flex={3} display="flex" flexDir={"column"}>
                            <Box display={"flex"} flexDir={"row"}>
                                <FormControl mx={"4"}>
                                    <FormLabel
                                        fontSize={{ base: "xs", md: "lg" }}
                                    >
                                        Price (Rp)
                                    </FormLabel>
                                    <Input
                                        isRequired
                                        type="number"
                                        placeholder="Enter price per night"
                                        mb={"2"}
                                        defaultValue={roomData?.price}
                                        onChange={(e) =>
                                            setRoomPrice(e.target.value)
                                        }
                                    />
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        display="flex"
                        mb="10"
                        justifyContent={"center"}
                        w={"full"}
                        py={"2"}
                    >
                        <Button
                            type="button"
                            _hover=""
                            w={"300px"}
                            ml={"4"}
                            rounded={"3xl"}
                            bgColor="#D3212D"
                            onClick={btnEditRoom}
                        >
                            <Text color={"white"}>Save</Text>
                        </Button>
                    </Box>
                </Box>
            </Container>
        );
    }
}

export default ManageRoom;
