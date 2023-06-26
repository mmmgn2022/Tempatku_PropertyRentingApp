import {
    Box,
    Container,
    Text,
    Flex,
    UnorderedList,
    ListItem,
    useDisclosure,
    Button,
    Collapse,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Image, Heading, Divider, List, Link, Grid,
} from "@chakra-ui/react";
import SwiperCarousel from "../../../Components/SwiperCarousel/SwiperCarousel";

import "./PropertyDetail.css";
import {
    FaHome,
    FaPaintBrush,
    FaMapMarkerAlt,
    FaHeart,
    FaStar,
} from "react-icons/fa";
import { capitalizeFirstWord, formatRupiah } from "../../../helper";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import RoomCard from "../../../Components/RoomCard";
import Booking from "../../../Components/Booking";
import noimage from "../../../assets/noimage.png";
import Review from "../../../Components/Review";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Loading from "../../../Components/Loading";
import moment from "moment";



export default function PropertyDetail() {
    const [loadingPage, setLoadingPage] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    let token = localStorage.getItem("tempatku_login");
    const [events, setEvents] = useState([]); //for calendar
    const [uuidRoom, setUuidRoom] = useState(""); // for special price params api call
    const [specialPrice, setSpecialPrice] = useState([]);
    const [tenantProfile, setTenantProfile] = useState("");

    const params = useParams();
    const location = useLocation();
    console.log("paramssss", params);
    console.log("useLocation property detail", location);

    const [propertyDetail, setPropertyDetail] = useState([]);
    const [regency, setRegency] = useState("");
    const [propertyPrice, setPropertyPrice] = useState(0);
    const [tenantEmail, setTenantEmail] = useState("");
    const [gmaps, setGmaps] = useState("");
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextDay = tomorrow.toISOString().split("T")[0];
    const [inputCheckIn, setInputCheckIn] = useState(
        moment(location.state.inputCheckIn).format().split('T')[0] || today
    );
    const [inputCheckOut, setInputCheckOut] = useState(
        moment(location.state.inputCheckOut).format().split('T')[0] || nextDay
    );
    const getPropertyDetail = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/property/detail?uuid=${params.uuid}&start=${inputCheckIn}&end=${inputCheckOut}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("proeeeee", get);
            setPropertyDetail(get.data);
            setRegency(get.data.property_location.regency.name);
            // setPropertyPrice(get.data.rooms[0].price);
            setTenantEmail(get.data.user.email);
            setUuidRoom(get.data.rooms[0]?.uuid);
            setTenantProfile(get.data.user.user_detail?.image_profile);
            setGmaps(get.data.property_location.gmaps);
        } catch (error) {
            console.log(error);
        }
    };

    const [average, setAverage] = useState(0);
    const getAverage = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/review/average?uuid=${params.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAverage(get.data.avg_rating);
            console.log("average", get.data.avg_rating);
            setLoadingPage(false)
        } catch (error) {
            console.log(error);
        }
    };

    // MODAL
    const modalProperty = useDisclosure();

    // Get Room Available
    const [roomAvailable, setRoomAvailable] = useState([]);
    const getRoomAvailable = async () => {
        try {
            setLoadingButton(true)
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/property/room-available?uuid=${params.uuid}&start=${inputCheckIn}&end=${inputCheckOut}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setRoomAvailable(get.data);
            setPropertyPrice(get.data[0].price)
            setLoadingButton(false)
        } catch (error) {
            console.log(error);
        }
    };
    console.log("room available", roomAvailable);

    const printRoomCard = () => {
        return roomAvailable.map((val, idx) => {
            return (
                <RoomCard
                    name={val.room_category.name}
                    description={val.description}
                    price={val.price} // kalo ada special price gimana ?
                    capacity={val.capacity}
                    picture={val.picture_rooms}
                    uuid={val.uuid}
                    inputCheckIn={inputCheckIn}
                    inputCheckOut={inputCheckOut}
                />
            );
        });
    };

    const [pictureProperty, setPictureProperty] = useState([]);
    const getPictureProperty = async () => {
        try {
            let get = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/property/picture?uuid=${params.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPictureProperty(get.data);
            console.log("picture property", get);
        } catch (error) {
            console.log(error);
        }
    };

    const [reviews, setReviews] = useState([]);
    const getReviews = async () => {
        try {
            let review = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/review?uuid=${params.uuid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("review", review);
            setReviews(review.data);
        } catch (error) {
            console.log(error);
        }
    };
    console.log("state reviews", reviews);

    const printReviews = () => {
        if (reviews.length) {
            return reviews.map((val, idx) => {
                return (
                    <Box>
                        <Review
                            value={val.rating}
                            profile={val.user.user_detail.image_profile}
                            name={val.user.user_detail.name}
                            createdAt={val.createdAt}
                            comment={val.review}
                        />
                    </Box>
                );
            });
        } else {
            return <Text>No Review</Text>;
        }
    };

    useEffect(() => {
        getPropertyDetail();
        getRoomAvailable();
        getPictureProperty();
        getReviews();
        getAverage();
    }, []);

    useEffect(() => {
        getRoomAvailable();
        getPropertyDetail();
    }, [inputCheckIn, inputCheckOut]);


    //2. generates events with prices for each day of the year 
    useEffect(() => {
        generateCalendarEventsWithPrices();
    }, [propertyPrice])

    const generateCalendarEventsWithPrices = () => {
        const startOfYear = new Date("2023-01-01");
        const endOfYear = new Date("2023-12-31");
        const eventsData = generateEventsPrices(startOfYear, endOfYear, propertyPrice);
        setEvents(eventsData);
    }

    //3. for calendar price (pricing inside calendar for a year in 2023) --> normal price event
    // Generate events for each day of the year
    const generateEventsPrices = (startOfYear, endOfYear, propertyPrice) => {
        const eventsData = [];
        let currentDate = new Date(startOfYear);
        while (currentDate <= endOfYear) {
            const event = {
                title: formatRupiah(propertyPrice),
                start: currentDate.toISOString().split("T")[0],
                end: currentDate.toISOString().split("T")[0],
            };
            eventsData.push(event);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return eventsData;
    };

    // User can edit calendar :  (Drag Event of FullCalendar)
    const todayCalendar = new Date();
    todayCalendar.setDate(todayCalendar.getDate());
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [calendarEdit, setCalendarEdit] = useState([
        {
            title: "Check In",
            start: formatDate(todayCalendar),
            editable: true,
            classNames: ["edit-event-highlight"],
        },
    ]);

    const handleEventChange = (eventChangeInfo) => {
        const adjustedStartDate = new Date(eventChangeInfo.event.start);

        const formattedStartDate = formatDate(adjustedStartDate);

        setInputCheckIn(formattedStartDate);

        setCalendarEdit((prevCalendar) => {
            const updatedCalendar = prevCalendar.map((event) => {
                return {
                    ...event,
                    title: "Check In",
                    start: formattedStartDate,
                    editable: true,
                    droppable: true,
                };
            });
            return updatedCalendar;
        });
    };

    const calendarEvents = [
        ...events,
        ...calendarEdit
    ];
    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <>
                <Container m={'auto'} maxW='8xl'>
                    <Box p="10">
                        <Box
                            marginTop="10px">
                            <Heading fontWeight="600" fontSize="30px">
                                {propertyDetail?.property}
                            </Heading>
                            <Flex
                                flexWrap="wrap" mt="14px"
                                alignItems={"center"}
                            >
                                <Box>
                                    <FaStar color='orange' />
                                </Box>
                                <Box>
                                    <Text fontSize={{ base: "14px", sm: "16px" }}>&nbsp;
                                        {average === null ? "No Rating" : parseFloat(average).toFixed(1)}
                                    </Text>
                                </Box>
                                <Box px='4'></Box>
                                <Box>
                                    <Text fontSize={{ base: "14px", sm: "16px" }}>
                                        Location: {capitalizeFirstWord(regency)}, {propertyDetail?.property_location?.country}
                                    </Text>
                                </Box>
                            </Flex>
                        </Box>

                        <Box onClick={modalProperty.onOpen} cursor='pointer'>
                            <Box
                                display="grid" gridGap="10px" margin="20px 0"
                                gridTemplateAreas={{ base: "'first first' '. .' '. .'", md: "'first first . .' 'first first . .'" }}
                            >
                                <Box
                                    gridArea="first"
                                >
                                    <Image src={!pictureProperty[0] ? noimage : `${process.env.REACT_APP_API_IMG_URL}${pictureProperty[0]?.picture}`}
                                        borderRadius="10px"
                                        boxSize="100%"
                                        maxH={'50vh'}
                                        objectFit='cover'
                                    />
                                </Box>
                                <Box>
                                    <Image src={!pictureProperty[1] ? noimage : `${process.env.REACT_APP_API_IMG_URL}${pictureProperty[1]?.picture}`}
                                        borderRadius="10px"
                                        boxSize="100%"
                                        maxH={'25vh'}
                                        objectFit='cover'
                                    />
                                </Box>
                                <Box>
                                    <Image src={!pictureProperty[2] ? noimage : `${process.env.REACT_APP_API_IMG_URL}${pictureProperty[2]?.picture}`}
                                        borderRadius="10px"
                                        boxSize="100%"
                                        maxH={'25vh'}
                                        objectFit='cover'
                                    />
                                </Box>
                                <Box>
                                    <Image src={!pictureProperty[3] ? noimage : `${process.env.REACT_APP_API_IMG_URL}${pictureProperty[3]?.picture}`}
                                        borderRadius="10px"
                                        boxSize="100%"
                                        maxH={'25vh'}
                                        objectFit='cover'
                                    />
                                </Box>
                                <Box>
                                    <Image src={!pictureProperty[4] ? noimage : `${process.env.REACT_APP_API_IMG_URL}${pictureProperty[4]?.picture}`}
                                        borderRadius="10px"
                                        boxSize="100%"
                                        maxH={'25vh'}
                                        objectFit='cover'
                                    />
                                </Box>
                            </Box>
                        </Box>
                        <Modal isOpen={modalProperty.isOpen} onClose={modalProperty.onClose}>
                            {/* <ModalOverlay /> */}
                            <ModalContent maxH="700px" maxW="700px">
                                <ModalHeader>Picture Property</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <Box>
                                        <SwiperCarousel pictureProperty={pictureProperty} />
                                    </Box>
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                        <Box
                        >
                            <Heading
                                fontSize={{ base: "14px", sm: "20px" }} marginTop={{ base: '20px', md: '16px' }}
                                fontWeight="500">
                                Hosted by {propertyDetail?.user?.user_detail?.name}
                            </Heading>
                        </Box>
                        <Flex w='full' direction={{ base: 'column', lg: 'row' }}>
                            <Box w='full'>
                                <Divider
                                    my='10'
                                />
                                <List
                                    styleType="none" mt="50px" mb="50px"
                                >
                                    <ListItem
                                        position="relative" ml="30px" fontSize="20px" fontWeight="500" mb="20px"
                                    >
                                        <Box
                                            display="inline-block" position="absolute" top="5px" left="-40px"
                                        >
                                            <FaHome />
                                        </Box>
                                        <Text
                                            fontWeight="600"
                                            fontSize={{ base: "14px", sm: "16px" }}
                                        >
                                            Entire Home
                                        </Text>
                                        <Text display="block" fontWeight="400" fontSize={{ base: "14px", sm: "16px" }}>
                                            You will have the entire flat for you.
                                        </Text>
                                    </ListItem>
                                    <ListItem
                                        position="relative" ml="30px" fontSize="20px" fontWeight="500" mb="20px"
                                    >
                                        <Box
                                            display="inline-block" position="absolute" top="5px" left="-40px">
                                            <FaPaintBrush />
                                        </Box>
                                        <Text
                                            fontWeight="600"
                                            fontSize={{ base: "14px", sm: "16px" }}
                                        >
                                            Enhanced Clean
                                        </Text>
                                        <Text display="block" fontWeight="400" fontSize={{ base: "14px", sm: "16px" }}>
                                            This host has committed to tempatku's cleaning process.
                                        </Text>
                                    </ListItem>
                                    <ListItem
                                        position="relative" ml="30px" fontSize="20px" fontWeight="500" mb="20px"
                                    >
                                        <Box
                                            display="inline-block" position="absolute" top="5px" left="-40px">
                                            <FaMapMarkerAlt />
                                        </Box>
                                        <Text
                                            fontWeight="600"
                                            fontSize={{ base: "14px", sm: "16px" }}
                                        >
                                            Great Location
                                        </Text>
                                        <Text display="block" fontWeight="400" fontSize={{ base: "14px", sm: "16px" }}>
                                            90% of recent guests gave the location a 5 star rating.
                                        </Text>
                                    </ListItem>
                                    <ListItem
                                        position="relative" ml="30px" fontSize="20px" fontWeight="500" mb="20px"
                                    >
                                        <Box
                                            display="inline-block" position="absolute" top="5px" left="-40px">
                                            <FaHeart />
                                        </Box>
                                        <Text
                                            fontWeight="600"
                                            fontSize={{ base: "14px", sm: "16px" }}
                                        >
                                            Great Check-in Experience
                                        </Text>
                                        <Text display="block" fontWeight="400" fontSize={{ base: "14px", sm: "16px" }}>
                                            100% of recent guests gave the check-in process a 5 star rating.
                                        </Text>
                                    </ListItem>
                                </List>
                                <Divider
                                    my='10'
                                />
                                <Text
                                    maxWidth="700px" marginBottom="50px">
                                    {propertyDetail?.description}
                                </Text>
                                <Divider my='10' />
                            </Box>
                            <Box ml='4' mt={{ base: '0', lg: '10' }} mb={{ base: '20', lg: '0' }} alignItems='center'>
                                <Booking
                                    inputCheckIn={inputCheckIn}
                                    inputCheckOut={inputCheckOut}
                                    setInputCheckIn={setInputCheckIn}
                                    setInputCheckOut={setInputCheckOut}
                                    loadingButton={loadingButton} />
                                <Divider my='10' display={{ base: 'block', lg: 'none' }} />
                            </Box>
                        </Flex>
                        {/* CALENDAR */}
                        <Box overflowX={"auto"}>
                            <Box marginBottom="50px" w={{ base: "200vw", sm: "150vw", lg: "full" }} >
                                <Fullcalendar
                                    className="my-calendar"
                                    w='full'
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView={"dayGridMonth"}
                                    headerToolbar={{
                                        start: "today prev,next",
                                        center: "title",
                                        end: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    height={"90vh"}
                                    events={calendarEvents}
                                    eventChange={handleEventChange}
                                />
                            </Box>
                        </Box>
                        <Divider my='10' />
                        <Box>
                            {/* BUATIN COMPONENT KALO ROOM HABIS */}
                            {
                                roomAvailable.length ? printRoomCard() : <h1>NO ROOM AVAILABLE</h1>
                            }
                        </Box>
                        <Box
                            className="map"
                            mb="50px"
                            mt="50px"
                        >
                            <Heading
                                fontSize={{ base: "14px", sm: "16px" }} fontWeight={600} mb="30px">
                                Location on Map
                            </Heading>
                            {/* Di database belom ada isinya jd sementara pake image ini */}
                            <iframe src={"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.4018764056077!2d106.81971837573961!3d-6.210608860835795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5a7dd2776af%3A0xe29d86df556db6b7!2sPurwadhika%20Digital%20Technology%20School%20Jakarta!5e0!3m2!1sen!2sid!4v1684742679021!5m2!1sen!2sid"} width="600" height="450" style={{ border: "0" }} allowFullScreen="" loading="lazy"></iframe>
                            <Text fontWeight="bold" py='2' fontSize={{ base: "14px", sm: "16px" }}>
                                {capitalizeFirstWord(regency)}, {propertyDetail?.property_location?.country}
                            </Text>
                            <Text fontSize={{ base: "14px", sm: "16px" }}>It's like a mile away from home.</Text>
                        </Box>
                        <Divider my='10' />
                        <Flex
                            alignItems="center">
                            <Image
                                src={tenantProfile == null ? "https://ionicframework.com/docs/img/demos/avatar.svg" : tenantProfile && tenantProfile.includes('http') ? tenantProfile : `${process.env.REACT_APP_API_IMG_URL}${tenantProfile}` ? `${process.env.REACT_APP_API_IMG_URL}${tenantProfile}` : "https://ionicframework.com/docs/img/demos/avatar.svg"}
                                boxSize="70px"
                                objectFit="cover"
                                borderRadius="50%"
                                mr="30px"
                            />
                            <Box>
                                <Heading
                                    fontSize={{ base: "14px", sm: "16px" }} mb="10px" fontWeight="600">
                                    Hosted by {propertyDetail?.user?.user_detail?.name}
                                </Heading>
                                <Flex wrap="wrap" alignItems="center" mt="10px">
                                    <Text fontSize={{ base: "14px", sm: "16px" }}>{tenantEmail}</Text>
                                </Flex>
                            </Box>
                        </Flex>
                        {/* <Link href={`mailto:${tenantEmail}`} mt="20px" display="inline-block" textDecoration="none" color="#555" py="15px" px={{ base: '20px', sm: "50px" }} border="1px solid #D3212D" borderRadius="8px"
                        fontSize={{ base: "14px", sm: "16px" }}
                    >
                        Contact Tenant
                    </Link> */}
                        <Divider
                            my='10'
                        />
                        {/* REVIEW */}
                        <Box mb='20'>
                            <Text fontSize={{ base: "14px", sm: "16px" }} fontWeight={600} mb='10'
                                textAlign={{ base: 'center', md: 'left' }}
                            >
                                Customer Reviews
                            </Text>
                            <Grid
                                templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                                gap={5}
                            >
                                {printReviews()}
                            </Grid>

                        </Box>
                    </Box>
                </Container>
            </>
        )
    }

}
