import React, { useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "./SwiperCarousel.css";

// import required modules
import { FreeMode, Navigation, Thumbs } from "swiper";

export default function SwiperCarousel(props) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    return (
        <>
            <Swiper
                style={{
                    "--swiper-navigation-color": "#fff",
                    "--swiper-pagination-color": "#fff",
                }}
                loop={true}
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="mySwiper2"
            >
                {props?.pictureProperty?.map((val, idx) => {
                    return (
                        <SwiperSlide>
                            <img style={{ width: '650px', height: '435px' }}
                                src={`${process.env.REACT_APP_API_IMG_URL}${val.picture}`}
                            />
                        </SwiperSlide>
                    );
                })}
                {props?.pictureRoom?.map((val, idx) => {
                    return (
                        <SwiperSlide>
                            <img style={{ width: '650px', height: '435px' }}
                                src={`${process.env.REACT_APP_API_IMG_URL}${val.picture}`}
                            />
                        </SwiperSlide>
                    );
                })}
            </Swiper>
            <Swiper
                onSwiper={setThumbsSwiper}
                loop={true}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="mySwiper"
            >
                {props?.pictureProperty?.map((val, idx) => {
                    return (
                        <SwiperSlide>
                            <img style={{ width: '160px', height: '110px' }}
                                src={`${process.env.REACT_APP_API_IMG_URL}${val.picture}`}
                            />
                        </SwiperSlide>
                    );
                })}
                {props?.pictureRoom?.map((val, idx) => {
                    return (
                        <SwiperSlide>
                            <img style={{ width: '160px', height: '110px' }}
                                src={`${process.env.REACT_APP_API_IMG_URL}${val.picture}`}
                            />
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </>
    );
}
