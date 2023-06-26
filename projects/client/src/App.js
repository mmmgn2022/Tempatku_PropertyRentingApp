import axios from "axios";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import React from "react";
import UserRegister from "./Pages/UserRegister";
import { useDispatch, useSelector } from "react-redux";
import { loginAction } from "./reducers/auth";
import ChangePassword from "./Pages/ChangePassword";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Landing from "./Pages/Landing/Landing";
import TenantRegister from "./Pages/TenantRegister";
import TenantDashboard from "./Pages/Tenant/TenantDashboard";
import NotFound from "./Pages/NotFound";
import Verification from "./Pages/Verification";
import FilteredProperty from "./Pages/User/FilteredProperty/FilteredProperty";
import PropertyDetail from "./Pages/User/PropertyDetail/PropertyDetail";
import Payments from "./Pages/User/Payments";
import PaymentDetail from "./Pages/User/PaymentDetail";
import OrderLists from "./Pages/User/OrderLists";
import EditProfile from "./Pages/EditProfile";
import AddProperty from "./Pages/Tenant/AddProperty";
import ManageProperty from "./Pages/Tenant/ManageProperty";
import AddRoom from "./Pages/Tenant/AddRoom";
import ManageRoom from "./Pages/Tenant/ManageRoom";
import PropertyList from "./Pages/Tenant/PropertyList";
import RoomList from "./Pages/Tenant/RoomList";
import RoomConditionList from "./Pages/Tenant/RoomConditionList";
import SalesReport from "./Pages/Tenant/SalesReport";
import OrderListTenant from "./Pages/Tenant/OrderListTenant";

function App() {
    const dispatch = useDispatch();
    const role = useSelector((state) => state.authReducer.role);
    const [isLoading, setIsLoading] = React.useState(false);


    const keepLogin = async () => {
        try {
            setIsLoading(true);
            let token = localStorage.getItem("tempatku_login");
            if (token) {
                let response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/user/keep-login`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                localStorage.setItem("tempatku_login", response.data.token);
                dispatch(loginAction(response.data));
            }
        } catch (error) {
            console.log("ini error dari keeplogin : ", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        keepLogin();
    }, []);

    return (
        <>
            <Navbar isLoading={isLoading} />
            {
                // User
                role == "User" ? (
                    <Routes>
                        <Route
                            path="/password/change"
                            element={<ChangePassword />}
                        />
                        <Route
                            path="/register/tenant"
                            element={<TenantRegister />}
                        />
                        <Route
                            path="/password/forgot"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/password/reset/:token"
                            element={<ResetPassword />}
                        />
                        <Route
                            path="/account/verification/:token"
                            element={<Verification />}
                        />
                        <Route path="/" element={<Landing />} />
                        <Route path="*" element={<NotFound />} />
                        <Route
                            path="/profile/edit"
                            element={
                                <EditProfile
                                    keepLogin={() => dispatch(keepLogin())}
                                    isLoading={isLoading}
                                />
                            }
                        />
                        <Route
                            path="/property"
                            element={<FilteredProperty />}
                        />
                        <Route
                            path="/property/detail/:uuid"
                            element={<PropertyDetail />}
                        />
                        <Route path="/payment/:uuid" element={<Payments />} />
                        <Route
                            path="/payment/detail/:uuid"
                            element={<PaymentDetail />}
                        />
                        <Route path="/order/list" element={<OrderLists />} />
                    </Routes>
                ) : // Tenant

                role == "Tenant" ? (
                    <Routes>
                        <Route
                            path="/password/change"
                            element={<ChangePassword />}
                        />
                        <Route
                            path="/password/forgot"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/password/reset/:token"
                            element={<ResetPassword />}
                        />
                        <Route
                            path="/dashboard"
                            element={<TenantDashboard />}
                        />
                        <Route path="*" element={<NotFound />} />
                        <Route
                            path="/profile/edit"
                            element={
                                <EditProfile
                                    keepLogin={() => dispatch(keepLogin())}
                                    isLoading={isLoading}
                                />
                            }
                        />
                        <Route path="/listing" element={<AddProperty />} />
                        <Route
                            path="/listing/edit/:uuid"
                            element={<ManageProperty />}
                        />
                        <Route path="/room" element={<AddRoom />} />
                        <Route
                            path="/room/edit/:uuid"
                            element={<ManageRoom />}
                        />
                        <Route path="/properties" element={<PropertyList />} />
                        <Route path="/rooms/:uuid" element={<RoomList />} />
                        <Route
                            path="/special/:uuid"
                            element={<RoomConditionList />}
                        />
                        <Route path="/statistics" element={<SalesReport />} />
                        <Route
                            path="/tenantorderlist"
                            element={<OrderListTenant />}
                        />
                    </Routes>
                ) : (
                    // Not logged in
                    <Routes>
                        <Route
                            path="/password/change"
                            element={<ChangePassword />}
                        />
                        <Route
                            path="/register/user"
                            element={<UserRegister />}
                        />
                        <Route
                            path="/register/tenant"
                            element={<TenantRegister />}
                        />
                        <Route
                            path="/password/forgot"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/password/reset/:token"
                            element={<ResetPassword />}
                        />
                        <Route
                            path="/account/verification/:token"
                            element={<Verification />}
                        />
                        <Route path="/" element={<Landing />} />
                        <Route path="*" element={<NotFound />} />
                        <Route
                            path="/property"
                            element={<FilteredProperty />}
                        />
                        <Route
                            path="/property/detail/:uuid"
                            element={<PropertyDetail />}
                        />
                    </Routes>
                )
            }
            <Footer />
        </>
    );
}

export default App;
