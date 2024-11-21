import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';


interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPallette: React.FC<ColorPickerProps> = ({ color = '#fff', onChange }) => {
  const [currentColor, setCurrentColor] = useState(color);

  const handleChange = (newColor: string) => {
    setCurrentColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="color-picker">
      <HexColorPicker color={currentColor} onChange={handleChange} />
    </div>
  );
};

export default ColorPallette;