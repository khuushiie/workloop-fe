
import React, { CSSProperties } from "react";
import { Carousel } from "antd";
import ResourceProjectCard from "./ResourceProjectCards";
import type { AllocationItem } from "./ResourceProjectCards";


interface ArrowProps {
  className?: string;
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

interface ResourceHistoryCarouselProps {
  items: AllocationItem[];
  confirmDelete: (id: string) => void;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
}


const ResourceHistoryCarousel: React.FC<ResourceHistoryCarouselProps> = ({
  items,
  confirmDelete,
  setShowDeleteModal,
}) => {

const CustomPrevArrow: React.FC<ArrowProps> = ({ className, style, onClick }) =>{
    return (
      <div
        className={`${className} custom-prev after:!hidden`}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
        onClick={onClick}
      >
        <span style={{ color: "black", fontSize: "38px" }}>‹</span>
      </div>
    );
  };

  const CustomNextArrow: React.FC<ArrowProps> = ({ className, style, onClick })  => {
    return (
      <div
        className={`${className} custom-next after:!hidden`}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
        onClick={onClick}
      >
        <span style={{ color: "black", fontSize: "38px" }}>›</span>
      </div>
    );
  };

  return (
    <div className="relative px-6 md:px-10">
      <Carousel
        arrows
        infinite={false}
        speed={450}
        easing="ease-in-out"
        slidesToShow={1}
        slidesToScroll={1}
        waitForAnimate
        draggable
        swipe
        prevArrow={<CustomPrevArrow />}
        nextArrow={<CustomNextArrow />}
        dotPosition="bottom"
      >
        {items.map((item) => (
          <div
            key={ item._id}
            className="flex justify-center md:p-4 min-h-[200px] overflow-visible"
          >
            <ResourceProjectCard
              data={item}
              mode="history"
              confirmDelete={confirmDelete}
              setShowDeleteModal={setShowDeleteModal}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ResourceHistoryCarousel;
