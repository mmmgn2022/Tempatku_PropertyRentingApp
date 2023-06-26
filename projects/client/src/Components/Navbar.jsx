import React from "react";
import {
  Icon,
  Text,
  Box,
  Flex,
  Avatar,
  HStack, Image,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure, Spinner,
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../reducers/auth";
import axios from "axios";
import Logo from "../assets/logotempatku.png";
import { useLocation } from "react-router-dom";


export default function Navbar(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scrollBehavior, setScrollBehavior] = React.useState("outside");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageProfile = useSelector((state) => state.authReducer?.image_profile);
  const role = useSelector((state) => state.authReducer.role);
  const password = useSelector((state) => state.authReducer.password);
  const { pathname } = useLocation();
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  // Login Page Modal
  const onOpenModal = () => {
    onOpen();
    setModalIsOpen(true);
  };

  const onCloseModal = () => {
    onClose();
    setModalIsOpen(false);
  };

  // React.useEffect(() => {
  //   if (pathname === "/") {
  //     onOpenModal();
  //   }
  // }, [pathname]);

  const onBtnLogout = () => {
    const cookieValue = document.cookie;
    // Check if cookie exists, if login by google but register via website
    if (cookieValue) {
      document.cookie = "googleAuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("tempatku_login");
      dispatch(logoutAction());
      navigate("/", { replace: true });
    } else {
      localStorage.removeItem("tempatku_login");
      dispatch(logoutAction());
      navigate("/", { replace: true });
    }
  };

  const onBtnLogoutGoogle = async () => {
    try {
      const cookieValue = document.cookie;
      let response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`, {
        headers: {
          Cookie: cookieValue,
        }
      });
      document.cookie = "googleAuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      dispatch(logoutAction());
      localStorage.removeItem("tempatku_login");
      navigate("/", { replace: true });
    } catch (error) {
      console.log("ini error dari onBtnGoogleLogout : ", error);
    }
  };

  React.useEffect(() => {
    if (isOpen && initialRef.current) {
      initialRef.current.focus(); // focus input inside modal
    }
  }, [isOpen]);

  return (
    <>
      <Box
        w="full" bg="white" zIndex={1}
        borderBottomWidth={1}
        borderStyle={"solid"}
        borderColor={"gray.200"}
      >
        <Box boxShadow={"xs"} px={{ base: "4", sm: "10" }}>
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            <HStack alignItems={"center"}>
              {/* Logo Tempatku */}
              {
                role == "User" ?
                  <Image src={Logo} alt="tempatku logo" boxSize="50px" onClick={() => navigate("/")} />
                  :
                  role == "Tenant" ?
                    <Image src={Logo} alt="tempatku logo" boxSize="50px" onClick={() => navigate("/dashboard")} />
                    :
                    <Image src={Logo} alt="tempatku logo" boxSize="50px" onClick={() => navigate("/")} />
              }
              {
                role == "User" ?
                  <Text
                    display={{
                      base: "none", sm: "none", md: "block"
                    }}
                    fontSize="23px"
                    fontWeight="600"
                    onClick={() => navigate("/")}
                    cursor={"pointer"}
                  >
                    tempatku
                  </Text>
                  :
                  role == "Tenant" ?
                    <Text
                      display={{
                        base: "none", sm: "none", md: "block"
                      }}
                      fontSize="23px"
                      fontWeight="600"
                      onClick={() => navigate("/dashboard")}
                      cursor={"pointer"}
                    >
                      tempatku
                    </Text>
                    :
                    <Text
                      display={{
                        base: "none", sm: "none", md: "block"
                      }}
                      fontSize="23px"
                      fontWeight="600"
                      onClick={() => navigate("/")}
                      cursor={"pointer"}
                    >
                      tempatku
                    </Text>
              }
              <HStack
                as={"nav"}
                spacing={4}
                display={{ base: "none", md: "flex" }}>
              </HStack>
            </HStack>

            <Flex alignItems={"center"}>

              {/* Become TENANT */}
              {
                // User
                role == "User" ?
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    mr={4}
                    _hover={"none"}
                    display={{ base: "none", sm: "none", md: "block" }}
                    onClick={() => navigate("/register/tenant")}
                  >
                    Become a Tenant
                  </Button>
                  :
                  // Tenant
                  role == "Tenant" ?
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      mr={4}
                      display={{ base: "none" }}
                      _hover={"none"}
                      onClick={() => navigate("/register/tenant")}
                    >
                      Become a Tenant
                    </Button>
                    :
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      mr={4}
                      _hover={"none"}
                      display={{ base: "none", sm: "none", md: "block" }}
                      onClick={() => navigate("/register/tenant")}
                    >
                      Become a Tenant
                    </Button>
              }

              {/* Main Menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                  border="1px"
                  color="gray.300"
                  p="1"
                  _active={"none"}
                >
                  <HamburgerIcon w={6} h={6} mx={2} my={1} color="black" />
                  {
                    // User
                    role == "User" ?
                      props.isLoading ? (<Spinner color='red.500' />) : (
                        <Avatar
                          size={"sm"}
                          src={
                            imageProfile == null
                              ? "https://ionicframework.com/docs/img/demos/avatar.svg"
                              : imageProfile && imageProfile.includes("http")
                                ? imageProfile
                                : `${process.env.REACT_APP_API_IMG_URL}${imageProfile}`
                                  ? `${process.env.REACT_APP_API_IMG_URL}${imageProfile}`
                                  : "https://ionicframework.com/docs/img/demos/avatar.svg"
                          }
                        />
                      )
                      :
                      // Tenant
                      role == "Tenant" ? props.isLoading ? (<Spinner color='red.500' />) : (
                        <Avatar
                          size={"sm"}
                          src={
                            imageProfile == null
                              ? "https://ionicframework.com/docs/img/demos/avatar.svg"
                              : imageProfile && imageProfile.includes("http")
                                ? imageProfile
                                : `${process.env.REACT_APP_API_IMG_URL}${imageProfile}`
                                  ? `${process.env.REACT_APP_API_IMG_URL}${imageProfile}`
                                  : "https://ionicframework.com/docs/img/demos/avatar.svg"
                          }
                        />
                      )
                        :
                        props.isLoading ? (<Spinner color='red.500' />) :
                          (
                            <Avatar
                              size={"sm"}
                              src={"https://ionicframework.com/docs/img/demos/avatar.svg"}
                            />
                          )
                  }
                </MenuButton>
                {
                  // User
                  role == "User" ?
                    <MenuList zIndex={9999}>
                      <MenuItem onClick={() => navigate("/")}>Home</MenuItem>
                      <MenuItem onClick={() => navigate("/profile/edit")}>Profile</MenuItem>
                      <MenuItem onClick={() => navigate("/order/list")}>Bookings</MenuItem>
                      {password != "NULL" ? (
                        <div>
                          <MenuItem onClick={() => navigate("/password/change")}>Change Password</MenuItem>
                        </div>
                      ) : null}
                      {password === "NULL" ? (
                        <div>
                          <MenuItem
                            onClick={onBtnLogoutGoogle}
                          >Logout</MenuItem>
                        </div>
                      ) : (
                        <div>
                          <MenuItem
                            onClick={onBtnLogout}
                          >Logout</MenuItem>
                        </div>
                      )}
                    </MenuList>
                    :
                    // Tenant
                    role == "Tenant" ?
                      <MenuList zIndex={9999}>
                        <MenuItem onClick={() => navigate("/dashboard")}>Dashboard</MenuItem>
                        <MenuItem onClick={() => navigate("/profile/edit")}>Profile</MenuItem>
                        <MenuItem onClick={() => navigate("/password/change")}>Change Password</MenuItem>
                        <MenuItem onClick={() => navigate("/properties")}>Manage Property / Rooms</MenuItem>
                        <MenuItem onClick={() => navigate("/tenantorderlist")}>Transaction</MenuItem>
                        <MenuItem onClick={() => navigate("/statistics")}>Statistics</MenuItem>
                        <MenuItem
                          onClick={onBtnLogout}
                        >Logout</MenuItem>
                      </MenuList>
                      :
                      <MenuList zIndex={9999}>
                        <MenuItem onClick={onOpen} maxH={"100vh"}>Login
                          <Modal onClose={onClose} isOpen={isOpen} scrollBehavior={scrollBehavior} trapFocus={true}>
                            <ModalOverlay />
                            <ModalContent>
                              <ModalCloseButton onClose={onCloseModal} />
                              <ModalBody>
                                {/* login modal */}
                                <Login
                                  onOpenModal={onOpenModal}
                                  onCloseModal={onCloseModal}
                                  initialRef={initialRef}
                                  finalRef={finalRef}
                                />
                              </ModalBody>
                            </ModalContent>
                          </Modal>
                        </MenuItem>
                        <MenuItem
                          onClick={() => navigate("/register/user")}
                        >Register</MenuItem>
                      </MenuList>
                }
              </Menu>
            </Flex>
          </Flex>
        </Box>
        <Box>
        </Box>
      </Box>
    </>
  );
}
