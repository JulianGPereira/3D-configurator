import '@google/model-viewer';
import { useEffect, useMemo, useRef, useState } from 'react';
import ColorPallette from '../components/ColorPallette';
import HotspotRenderer from '../components/HotspotRenderer';
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import AccessoryList from '../components/AccessoryList';
import { useControls } from 'leva'
import { Textarea } from '@mui/joy';

const Renderer: React.FC<any> = () => {
  const modelViewerRef = useRef(null);
  const [modelColor, setModelColor] = useState('#ff0000');
  const savedColors = useRef<Map<string, string>>(new Map()); 
  const originalColor = useRef<Map<any, any>>(new Map()); 
  const [bloomToggle, setBloomToggle] = useState(false);
  const selection = useRef<any>([]);
  const outlineSelection = useRef<any>([]); 
  const modelMeshes = useRef<any>([])
  const [modelLoaded, setModelLoaded] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(0);
  const [outlineIntensity, setOutlineIntensity] = useState(0);
  const [editEnable, setEditEnable] = useState(false);
  const [hotspotToggle, setHotspotToggle] = useState(true);
  const [envIndex, setEnvIndex] = useState<number>(-1);
  const addHotspot = useRef(false);
  const hotspotDetails = useRef<any>(null);
  const [open, setOpen] = React.useState(false);
  const [hotspotName, setHotspotName] = useState('');
  const [description, setDescription] = useState('');

  const [hotspotDetailsList, setHotspotDetailsList] = useState([]);
  const visibleAccessoryNames = useRef<string[]>([]);
  const [hotspotAnimationDescription, setHotspotAnimationDescription] = useState<string>('');

  const hrdList = [
    'https://modelviewer.dev/assets/spruit_sunrise_4k_LDR.jpg',
    'https://modelviewer.dev/shared-assets/environments/whipple_creek_regional_park_1k_HDR.jpg',
    'https://az0blob0idec0devqa.blob.core.windows.net/blob-file-ustudio-qa/hero-ustudio/artifacts/1728305069063-ustudio-xtreme-hdr.hdr',
    // 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/satara_night.jpg',
    // 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/clarens_night_01.jpg'
  ]

  const accessoryNames = {
      "Paddock Stand":[
        "paddock_stand_1",
        "paddock_stand_2",
      ],
      "Seat Cover":[
        "seat_cover_1",
        "seat_cover_2",
        "seat_cover_3",
        "seat_cover_4",
        "seat_cover_stripe"
      ],
      "Main Stand": "main_stand",
      "Rear Fender": 'rear_fender',
      "Tank Pads": "tank_pads"
  }

  const colorChangeItems = [
    "ybody",
    "ALLOY_AO2.001",
    "BLACKSHINYPLASTIC.001"
  ];

  const levaOptions = useMemo(()=>{
    return {
      intensity:{ value: 20, min: 10, max: 50, step: 10 }
    }
  },[])
  const highlightColor = useControls('Intensity',levaOptions)

  const handleClose = () => {
    addHotspot.current = false
    setOpen(false);
    handleExitEdit();
    setHotspotName('');
    setDescription('')
  };


  useEffect(() => {
    const modelViewer = document.querySelector?.("model-viewer#orbit-demo");
  
    const storeOriginalColors = async () => {
      modelViewer.timeScale = -1;
      for (const material of modelViewer?.model.materials) {
        await material.ensureLoaded();
        setModelLoaded(true);
        
        if (!originalColor.current.has(material.name)) {
          originalColor.current.set(material.name, {
            material: material,
            baseColor: material.pbrMetallicRoughness.baseColorFactor,
          });
        }
      }
      const symbols = Object.getOwnPropertySymbols(modelViewer.model);
      const primitiveSymbol = symbols.find(sym => sym.toString() === "Symbol(primitives)");
      modelMeshes.current = modelViewer.model[primitiveSymbol];
      setOutlineIntensity(0);
      
      //not working
      // const selectiveComposer = document?.querySelector("effect-composer#selectiveComposer");
      // const outlineEffect = selectiveComposer.querySelector("outline-effect");
      
      // if (outlineEffect) {
      //   outlineEffect.setAttribute("hiddenEdgeColor", "#000000");
      // }

    };
  
    if (modelViewer) {
      modelViewer.addEventListener("load", storeOriginalColors);
    }
  
    return () => {
      if (modelViewer) {
        modelViewer.removeEventListener("load", storeOriginalColors);
      }
    };
  }, []);

  const handleColorChange = (color: string) => {
    setModelColor(color);
  };

  function convertToOrbitString({ theta, phi, radius }) {
    const thetaDeg = (theta * 180) / Math.PI;
    const phiDeg = (phi * 180) / Math.PI;
    const radiusMeters = `${radius.toFixed(3)}m`;
    return `${thetaDeg.toFixed(1)}deg ${phiDeg.toFixed(1)}deg ${radiusMeters}`;
  }

  useEffect(() => {
    const modelViewer = document.querySelector?.("model-viewer#orbit-demo");
      const changeColor = (event) => {
        if (event.target.closest(".controls-button") || event.target.closest(".dialog-popup")) {
          return; // Ignore clicks on UI elements with the class 'ui-button'
        }
      
        if (modelViewer && modelViewer.modelIsVisible) {
          const material = modelViewer.materialFromPoint(event.clientX, event.clientY);
          if (material != null) {

            hotspotDetails.current = {
              surface: modelViewer.surfaceFromPoint(event.clientX, event.clientY),
              orbit: convertToOrbitString(modelViewer.getCameraOrbit()) ,
              target: `${modelViewer.getCameraTarget().x}m ${modelViewer.getCameraTarget().y}m ${modelViewer.getCameraTarget().z}m`,
              fieldOfView: `${modelViewer.getFieldOfView()}deg`,
              visibilityAttribute: "visible",
              title: "Hotspot",
              material: material.name
            }
           console.log(material.name)
            if(editEnable && colorChangeItems.findIndex((elem)=> elem === material.name)!==-1) {
            outlineSelectedMesh(material.name);
            material.pbrMetallicRoughness.setBaseColorFactor(modelColor);
            savedColors.current.set(material.name, modelColor);
          }
          if(addHotspot.current) {
            outlineSelectedMesh(material.name);
            setOpen(true)
          }
          } 
        }
      };
      document.addEventListener("click", changeColor);
      return () => {
        document.removeEventListener("click", changeColor);
      };
    
  }, [modelColor, editEnable]);
  
  const outlineSelectedMesh = (materialName: string)=> {
    setOutlineIntensity(10);
    outlineSelection.current = [];
    const selectiveComposer = document?.querySelector("effect-composer#selectiveComposer");
    const outlineMesh = selectiveComposer?.querySelector('outline-effect');

    modelMeshes.current.forEach((primitive: { mesh: any; }) => {
      const mesh = primitive.mesh;
     if(materialName === mesh.material.name) {
       console.log(mesh.name)
      outlineSelection.current.push(mesh)
     }
    });
    outlineMesh.selection = outlineSelection.current
  }

  const handleSave = ()=>{
    console.log({
      savedColors: Object.fromEntries(savedColors.current),
      accessoryList: visibleAccessoryNames.current,
      hotspotDetails: hotspotDetailsList,
      bloomSettings: { bloomIntensity, bloomToggle },
      environment: envIndex
    });

    originalColor.current.forEach((properties, _) => {
      properties.material.pbrMetallicRoughness.setBaseColorFactor(properties.baseColor);
    });
    savedColors.current = new Map();
    visibleAccessoryNames.current = [];
  }

  const handleExitEdit = ()=>{
    setEditEnable(false)
    setOutlineIntensity(0);
  }

  const handleEnterEdit = ()=>{
    setEditEnable(true)
  }

  const toggleMeshVisibility = (accNames: string[])=>{
    let meshes = []
    accNames.forEach((elem)=>{
      meshes = meshes.concat( accessoryNames[elem])
    })
    visibleAccessoryNames.current = accNames;
    const visibleAcc = Object.values(accessoryNames).flat().filter(item => !new Set(meshes).has(item));
    modelMeshes.current.forEach((primitive: { mesh: any; }) => {
      const mesh = primitive.mesh;
     if(meshes.findIndex((item)=> item === mesh.name) !== -1) {
       mesh.visible = true
     }
     if(visibleAcc.findIndex((item)=> item === mesh.name) !== -1) {
      mesh.visible = false
    }
    });
    const selectiveComposer = document?.querySelector?.("effect-composer#selectiveComposer");
    selectiveComposer.queueRender()

  }

  const toggleHotspotVisibility = ()=>{
    const modelViewer = document.querySelector?.("model-viewer#orbit-demo");
    modelViewer.cameraOrbit = "-53.13deg 88.66deg 4.175m";
    modelViewer.fieldOfView = "45deg";
    modelViewer.cameraTarget =
      "0.05485524710299838m 0.5814241969483078m 3.302602388788323e-8m";
      setOutlineIntensity(0);
    setHotspotToggle((value)=>!value);
  }
  
  useEffect(() => {
    const modelViewer = document?.querySelector?.("model-viewer#orbit-demo");
    const selectiveComposer = document?.querySelector?.("effect-composer#selectiveComposer");
    const selectiveBloom = selectiveComposer?.querySelector?.("selective-bloom-effect");

    if(modelLoaded) {
      const symbols = Object.getOwnPropertySymbols(modelViewer.model);
      const primitiveSymbol = symbols.find(sym => sym.toString() === "Symbol(primitives)");
      const primitives = modelViewer.model[primitiveSymbol];
      selection.current = []
      primitives.forEach((primitive) => {
        const mesh = primitive.mesh;
        //hides accessory
        if(Object.values(accessoryNames).flat().findIndex((item)=> item === mesh.name) !== -1) {
          mesh.visible = false
        }
       // Change this name as per your mesh
        if(bloomToggle) {
          //mesh.name === 'Daytime_Running_Lamps_1' || mesh.name === 'Daytime_Running_Lamps_2'
          if ( mesh.name === 'H4001' || mesh.name === 'headlight_emission' || mesh.name === 'Daytime_Running_Lamps_1' || mesh.name === 'Daytime_Running_Lamps_2' || mesh.name ==='mesh125571997_3') {
            mesh.material.emissiveIntensity = 1000;
            selection.current.push(mesh);
          }
        } 
      });
      selectiveBloom.selection = selection.current;
    }
  }, [bloomToggle, modelLoaded]);

  const toggleAnimation = (hotspotDetail: any) => {
    const modelViewer = document.querySelector("model-viewer#orbit-demo");
    modelViewer.cameraTarget = hotspotDetail.target;
    modelViewer.cameraOrbit = hotspotDetail.orbit;
    modelViewer.fieldOfView = hotspotDetail.fieldOfView ? hotspotDetail.fieldOfView : "45deg";
    outlineSelectedMesh(hotspotDetail.material)
  };

  const animateThroughHotSpots = () => {
    const modelViewer = document.querySelector("model-viewer#orbit-demo");
    let index = 0;
  
    if (hotspotDetailsList.length > 0) {
      const dataset = hotspotDetailsList[index];
      modelViewer.cameraTarget = dataset?.target;
      modelViewer.cameraOrbit = dataset?.orbit;
      modelViewer.fieldOfView = dataset?.fieldOfView ? dataset?.fieldOfView : "45deg";
      index++;
      outlineSelectedMesh(dataset.material)
      setHotspotAnimationDescription(dataset.description)
    }
    const intervalId = setInterval(() => {
      if (index < hotspotDetailsList.length) {
        const dataset = hotspotDetailsList[index];
        modelViewer.cameraTarget = dataset?.target;
        modelViewer.cameraOrbit = dataset?.orbit;
        modelViewer.fieldOfView = dataset?.fieldOfView ? dataset?.fieldOfView : "45deg";
        outlineSelectedMesh(dataset.material)
        setHotspotAnimationDescription(dataset.description)
      } else if (index === hotspotDetailsList.length) {
        setHotspotAnimationDescription('')
        // Reset to default view after animation
        modelViewer.cameraOrbit = "-53.13deg 88.66deg 4.175m";
        modelViewer.fieldOfView = "45deg";
        modelViewer.cameraTarget =
          "0.05485524710299838m 0.5814241969483078m 3.302602388788323e-8m";
        clearInterval(intervalId);
        handleExitEdit();
      }
      index++;
    }, 5000);
  };

  const handleBloom = ()=>{
    setBloomIntensity((value)=> value === highlightColor.intensity ? 0 : highlightColor.intensity);
    setBloomToggle((value)=> !value)
  }

  const switchEnv = ()=>{
    setEnvIndex((value)=>  value === 2 ? -1 : value+=1)
  }

  const toggleHotspotAddition = ()=>{
    addHotspot.current = true
  }

  const handleInputChange = (event) => {
    setHotspotName(event.target.value);
  };

  const handleDescriptionChange = (event)=>{
    setDescription(event.target.value)
  }

  const handleSubmit = () => {
    if (!hotspotDetails.current) {
      console.error("hotspotDetails.current is undefined.");
      return;
    }
    const updatedHotspot = { 
      ...hotspotDetails.current, 
      title: hotspotName,
      description: description
    };
    setHotspotDetailsList((prevHotspots) => [
      ...prevHotspots,
      {
        ...updatedHotspot,
        slot: `hotspot-${prevHotspots.length}`,
      },
    ]);
    handleClose();
  };

  const toggleModelAnimation = ()=>{
    const modelViewer = document.querySelector("model-viewer#orbit-demo");
    modelViewer.timeScale = modelViewer.timeScale === 1 ? -1 : 1;
    modelViewer.play({repetitions: 1});
    
  }


      return (
        <>
          <div className="controls">
            <ColorPallette color={modelColor} onChange={handleColorChange} />
          </div>
          <div className="controls-button">
            {/* <button onClick={handleResetColor}>Reset Color</button>{" "} */}
            <button onClick={handleSave}>Save</button>
            <button onClick={handleEnterEdit}>Edit</button>
            <button onClick={handleExitEdit}>Exit Edit</button>
            <AccessoryList names = {Object.keys(accessoryNames)} selectedAccNames = {toggleMeshVisibility}/>
            <button onClick={toggleHotspotVisibility}>Hide/show Hotspot</button>
            <button onClick={toggleHotspotAddition}>Add Hotspot</button>
            <button onClick={toggleModelAnimation}>Animation</button>
            <Dialog
            className='dialog-popup'
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Hotspot"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Select a name for hotspot
              </DialogContentText>
            <div className='hotspot-details'>
            <TextField id="standard-basic" label="Name" variant="standard" value={hotspotName}
                onChange={handleInputChange} />
                <Textarea minRows={2}  label="Description" placeholder="Description"  value={description}
                onChange={handleDescriptionChange}  />
            </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} autoFocus>
                Ok
              </Button>
            </DialogActions>
          </Dialog>

            <button onClick={handleBloom}>Bloom</button>
            <button onClick={switchEnv}>Env</button>
            <button onClick={animateThroughHotSpots}>View Hotspots</button>
          </div>
          <model-viewer
          //skybox-height='2m'
          shadow-softness='3'
          shadow-intensity='1'
            animation-name="seat"
            camera-controls
            camera-orbit="-53.13deg 88.66deg 4.175m"
           // max-camera-orbit="auto 90deg auto" 
            field-of-view="30deg"
            ref={modelViewerRef}
            id="orbit-demo"
            interpolation-decay="100"
            skybox-image= {hrdList[envIndex]}
            // skybox-image=''
            //skybox-height="1.5m"
            exposure="1"
            // src = "https://modelviewer.dev/shared-assets/models/RocketShip.glb"
            // src="/assets/models/1730111190264-1725856166982-Destini_Vx.glb"
            src="/assets/models/karizma_with_accessoriesV1.1.glb"
            // src = "/assets/models/karizma_with_accessories.glb"
            // src="https://modelviewer.dev/shared-assets/models/EmissiveStrengthTest.glb"
            // alt="Model"
            style={{
              width: "100%", 
              height: "100%",
              position: "absolute", // Position to cover the screen
              top: 0,
              left: 0,
              backgroundColor: "grey",
            }}            
          >
            {hotspotToggle ? (
              <>
                <HotspotRenderer onChange ={toggleAnimation} createdHotspotList = {hotspotDetailsList} animationHotspotDescription={hotspotAnimationDescription} />
              </>
            ) : null}

            <div className="progress-bar hide" slot="progress-bar">
              <div className="update-bar"></div>
            </div>

            <effect-composer id="selectiveComposer" render-mode="performance">
            <smaa-effect quality ='medium'></smaa-effect>
              <selective-bloom-effect
                strength={bloomIntensity}
                radius="0.1"
                threshold="0.2"
              ></selective-bloom-effect>
              <outline-effect color="blue" strength={outlineIntensity} smoothing={2} hidden-edge-color="#0000"/>
              <color-grade-effect />
            </effect-composer>
          </model-viewer>
      </>
      );
  }

export default Renderer