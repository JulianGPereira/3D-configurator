import HotSpotButtons from "./HotspotButtons";

interface HotspotRenderer {
  onChange: () => void;
  createdHotspotList: any[]
}

const HotspotRenderer: React.FC<HotspotRenderer> = ({ onChange, createdHotspotList }) => {

  const toggleAnimation = () => {
    onChange();
  };
 
  return (
    <>
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
