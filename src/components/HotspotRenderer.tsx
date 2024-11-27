import { useEffect, useState } from "react";
import HotSpotButtons from "./HotspotButtons";

interface HotspotRenderer {
  onChange: (hotspotDetail: any) => void;
  createdHotspotList: any[];
  animationHotspotDescription: string
}

const HotspotRenderer: React.FC<HotspotRenderer> = ({ onChange, createdHotspotList, animationHotspotDescription }) => {

  //if cameraFOV is 45 degree make toggle false
  const [descriptionToggle, setDescriptionToggle] = useState<boolean>(false)
  const [description, setDescription] = useState<string>('');

  const toggleAnimation = (hotspotDetail: any) => {
    if(document.activeElement.id === "Hotspot")
    {
      setDescription(hotspotDetail.description) 
      setDescriptionToggle(true)
    }
    onChange(hotspotDetail);
  };

  useEffect(()=>{
    setDescriptionToggle(true)
    setDescription(animationHotspotDescription)
  },[animationHotspotDescription])
 
  return (
    <>
      {
        descriptionToggle && description? <div className="annotation">{description}</div> : null
      }
      {createdHotspotList.map((hotspotDetail) => {
        return (
          <HotSpotButtons
            hotspotDetail={hotspotDetail}
            onChange={toggleAnimation}
          />
        );
      })}
    </>
  );
};

export default HotspotRenderer;
