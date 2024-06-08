import Slider from "react-slick";

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplaySpeed: 2000,
    speed: 500,
    arrows: false,
    autoplay: true,
    lazyLoad: "ondemand",
    pauseOnHover: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <Slider {...settings}>
      <div>
        <img
          src="banner1.jpg"
          alt="Banner 1"
          className="w-full h-[700px] object-cover"
        />
      </div>
      <div>
        <img
          src="banner2.jpg"
          alt="Banner 1"
          className="w-full h-[700px] object-cover"
        />
      </div>
      <div>
        <img
          src="banner3.jpg"
          alt="Banner 1"
          className="w-full h-[700px] object-cover"
        />
      </div>
      <div>
        <img
          src="banner4.jpg"
          alt="Banner 1"
          className="w-full h-[700px] object-cover"
        />
      </div>
    </Slider>
  );
};

export default Carousel;
