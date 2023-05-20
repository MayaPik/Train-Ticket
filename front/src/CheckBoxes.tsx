import React, { useState, useEffect } from "react";
import { AppBar, Checkbox, FormControlLabel } from "@mui/material";

import "./App.css";

interface Props {
  setFilters: (filters: {
    exposedOnly: boolean;
    sinkOnly: boolean;
    vulnerableOnly: boolean;
  }) => void;
}

function CheckBoxes({ setFilters }: Props) {
  const [filters, setFiltersState] = useState({
    exposedOnly: false,
    sinkOnly: false,
    vulnerableOnly: false,
  });

  useEffect(() => {
    setFilters(filters);
  }, [filters, setFilters]);

  const handleChange = (filterName: string) => {
    setFiltersState((prevState: any) => ({
      ...prevState,
      [filterName]: !prevState[filterName],
    }));
  };

  const formatLabel = (filterName: string) => {
    return filterName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <AppBar position="static">
      <div className="navBar">
        <b>Please choose filters:</b>
        {Object.entries(filters).map(([filterName, isChecked]) => (
          <FormControlLabel
            key={filterName}
            control={
              <Checkbox
                checked={isChecked}
                onChange={() => handleChange(filterName)}
                name={filterName}
              />
            }
            label={formatLabel(filterName)}
          />
        ))}
      </div>
    </AppBar>
  );
}

export default CheckBoxes;
