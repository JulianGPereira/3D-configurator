interface HotSpotButtons {
  hotspotDetail: any
  onChange: (hotspotDetail: any) => void;
}

const HotSpotButtons: React.FC<HotSpotButtons> = ({ hotspotDetail, onChange }) => {
  const toggleAnimation = () => {
    onChange(hotspotDetail);
  };

  return (
    <>
      <button
        id="Hotspot"
        className="Hotspot"
        slot={hotspotDetail.slot}
        data-surface={hotspotDetail.surface}
        data-visibility-attribute={hotspotDetail.visibilityAttribute}
        data-orbit={hotspotDetail.orbit}
        data-target={hotspotDetail.target}
        data-field-of-view={hotspotDetail.fieldOfView}
        onClick={toggleAnimation}
      >
        <div className="HotspotAnnotation">{hotspotDetail.title}</div>
      </button>
    </>
  );
};

export default HotSpotButtons;
