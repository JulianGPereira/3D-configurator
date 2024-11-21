import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};



const AccessoryList: React.FC<{names: string[], selectedAccNames: (value: string[])=> void }> = ({names, selectedAccNames})=> {
  const [accessoryNames, setAccessoryNames] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof accessoryNames>) => {
    const {
      target: { value },
    } = event;
    setAccessoryNames(
      typeof value === 'string' ? value.split(',') : value,
    );
    selectedAccNames(value)
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 137 }}>
        <InputLabel id="demo-multiple-checkbox-label">Accessories</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={accessoryNames}
          onChange={handleChange}
          input={<OutlinedInput label="Accessories" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {names?.map((name) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={accessoryNames.includes(name)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
export default AccessoryList