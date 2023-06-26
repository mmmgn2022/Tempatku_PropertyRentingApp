import React from "react";
import { Box, Heading, Text, Button, Flex, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Pagenotfound from "../assets/page-not-found.svg"
import { useSelector } from "react-redux";
import Loading from "../Components/Loading";


export default function NotFound() {
    const [loadingPage, setLoadingPage] = React.useState(true);
    const navigate = useNavigate();
    const role = useSelector((state) => state.authReducer.role);


    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            setLoadingPage(false);
        }, 1700);
    }, []);

    if (loadingPage) {
        return <Loading />
    } else {
        return (
            <Flex
                justify={"center"}
                align={{ base: "none", sm: "center" }}
                minH={{ base: "100vh", lg: "100vh" }}
            >
                <Box
                    textAlign="center"
                    mt={{ base: "-10", sm: "-20" }}
                >
                    <Image src={Pagenotfound} boxSize={{ base: "400px", sm: "500px" }}></Image>
                    <Text fontSize={{ base: "2xl", sm: "4xl" }} fontWeight="bold" mt={-10} mb={2}>
                        Page Not Found
                    </Text>
                    <Text mb={6} fontSize={{ base: "sm", sm: "lg" }}>
                        The page you're looking for does not seem to exist
                    </Text>
                    {
                        role == "User" ?
                            <Button
                                backgroundColor="#D3212D"
                                color="white"
                                variant="solid"
                                onClick={() => navigate("/")}
                                _hover={{ bg: "#D3212D" }}
                                _active={{
                                    bg: "#D3212D",
                                    transform: "scale(0.98)",
                                }}
                                mb={16}
                            >
                                Return to Homepage
                            </Button>
                            :
                            role == "Tenant" ?
                                <Button
                                    backgroundColor="#D3212D"
                                    color="white"
                                    variant="solid"
                                    onClick={() => navigate("/dashboard")}
                                    _hover={{ bg: "#D3212D" }}
                                    _active={{
                                        bg: "#D3212D",
                                        transform: "scale(0.98)",
                                    }}
                                    mb={16}
                                >
                                    Return to Homepage
                                </Button>
                                :
                                <Button
                                    backgroundColor="#D3212D"
                                    color="white"
                                    variant="solid"
                                    onClick={() => navigate("/")}
                                    _hover={{ bg: "#D3212D" }}
                                    _active={{
                                        bg: "#D3212D",
                                        transform: "scale(0.98)",
                                    }}
                                    mb={16}
                                >
                                    Return to Homepage
                                </Button>
                    }
                </Box>
            </Flex>
        );
    }
}
