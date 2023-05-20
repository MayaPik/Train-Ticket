import React, { useState } from "react";
import AllPaths from "./AllPaths";
import CheckBoxes from "./CheckBoxes";
import "./App.css";

interface Filters {
  exposedOnly: boolean;
  sinkOnly: boolean;
  vulnerableOnly: boolean;
}

export default function App() {
  const [filters, setFilters] = useState<Filters>({
    exposedOnly: false,
    sinkOnly: false,
    vulnerableOnly: false,
  });

  return (
    <div className="App">
      <CheckBoxes setFilters={setFilters} />
      <AllPaths
        exposedOnly={filters.exposedOnly}
        sinkOnly={filters.sinkOnly}
        vulnerableOnly={filters.vulnerableOnly}
      />
    </div>
  );
}
