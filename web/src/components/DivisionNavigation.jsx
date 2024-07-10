import { TabView, TabPanel } from "primereact/tabview";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Menu } from "primereact/menu";
import {
  divisionChangeMap,
  hfuDivisions,
  uspsaDivisions,
  sportName, scsaDivisions
} from "../../../shared/constants/divisions";
import usePreviousEffect from "../utils/usePreviousEffect";

const enableSportSelector = true;

const SportSelector = ({ sportCode, setSportCode }) => {
  const menu = useRef(null);
  const items = [
    {
      items: [
        {
          label: "USPSA",
          className: sportCode === "uspsa" && "focused-menu-item",
          command: () => setSportCode("uspsa"),
        },
        {
          label: "SCSA",
          className: sportCode === "scsa" && "focused-menu-item",
          command: () => setSportCode("scsa"),
        },
        {
          label: "HitFactor (Unified)",
          className: sportCode === "hfu" && "focused-menu-item",
          command: () => setSportCode("hfu"),
        },
        {
          label: "PCSL (Coming Soon)",
          command: () => setSportCode("pcsl"),
          disabled: true,
        },
      ],
    },
  ];

  if (!enableSportSelector) {
    return null;
  }

  return (
    <div className="card flex justify-content-center">
      <Menu model={items} popup ref={menu} />
      <a
        role="tab"
        class="p-tabview-nav-link mr-4"
        tabIndex="-1"
        onClick={(e) => {
          e.preventDefault();

          menu.current.toggle(e);
          setTimeout(() => document.activeElement?.blur(), 0);
        }}
        aria-haspopup
      >
        <span class="p-tabview-title">{sportName(sportCode)}</span>
        <span class="pi pi-chevron-down ml-2 text-sm" />
      </a>
    </div>
  );
};

const divisionForSportAndIndex = (sport, index) => {
  switch(sport) {
    case 'hfu':
      return hfuDivisions[index - 1]?.short.toLowerCase();
    case 'scsa':
      return scsaDivisions[index - 1]?.short.toLowerCase();
    case 'uspsa':
    default:
      return uspsaDivisions[index - 1]?.short_name?.toLowerCase?.();
  }
};

const indexForDivision = (division) => {
  // scsa
  const scsaIndex = scsaDivisions.findIndex(
    (c) => c.short.toLowerCase() === (division || "invalid")
  );
  if (scsaIndex >= 0) {
    // plusOne the dataIndex, because TabView counts SportSelector as index 0
    return scsaIndex + 1;
  }

  // hfu
  const hfuIndex = hfuDivisions.findIndex(
    (c) => c.short.toLowerCase() === (division || "invalid")
  );
  if (hfuIndex >= 0) {
    // plusOne the dataIndex, because TabView counts SportSelector as index 0
    return hfuIndex + 1;
  }

  // uspsa
  const uspsaIndex = uspsaDivisions.findIndex(
    (c) => c?.short_name?.toLowerCase() === (division || "invalid")
  );
  if (uspsaIndex >= 0) {
    // plusOne the dataIndex, because TabView counts SportSelector as index 0
    return uspsaIndex + 1;
  }

  return -1;
};

export const DivisionNavigation = ({ onSelect, uspsaOnly }) => {
  // TODO: save in localStorage last sport/division selection
  const { division } = useParams();
  const [sportCode, setSportCode] = useState("uspsa");
  const [activeIndex, setActiveIndex] = useState(indexForDivision(division));

  // update selection if navigation changes
  useEffect(() => {
    setActiveIndex(indexForDivision(division));
  }, [division, setActiveIndex]);

  usePreviousEffect(
    ([prevSportCode]) => {
      if (sportCode === 'scsa'  || prevSportCode === 'scsa') {
        return;
      }
      if (prevSportCode === sportCode) {
        return;
      }
      const prevDivision = divisionForSportAndIndex(prevSportCode, activeIndex);
      const newDivision = divisionChangeMap[sportCode][prevDivision];
      const newIndex = indexForDivision(newDivision);

      // Default to 1 (Open/Comp), instead of -1 (not found) when changing sport
      setActiveIndex(newIndex >= 0 ? newIndex : 1);
      onSelect(newDivision);
    },
    [sportCode]
  );

  // TabView uses index off children, and even false as a child takes index
  const tabViewItems = [
    ...(sportCode !== "hfu"
      ? []
      : hfuDivisions.map((division) => (
          <TabPanel
            key={division.short}
            header={division.long}
            className="p-0 text-sm md:text-base"
          />
        ))),
    ...(sportCode !== "uspsa"
      ? []
      : uspsaDivisions.map((division) => (
          <TabPanel
            key={division.id}
            header={division.long_name}
            className="p-0 text-sm md:text-base"
          />
        ))),
    ...(sportCode !== "scsa"
      ? []
      : scsaDivisions.map((division) => (
        <TabPanel
          key={division.short}
          header={division.long}
          className="p-0 text-sm md:text-base"
        />
      ))),
  ];

  return (
    <div className="p-0 md:px-4">
      <TabView
        panelContainerClassName="p-0 md:px-8"
        activeIndex={activeIndex}
        onTabChange={({ index }) => {
          const newDivision = divisionForSportAndIndex(sportCode, index);
          onSelect?.(newDivision);
          setActiveIndex(index);
        }}
      >
        <TabPanel
          header="Mode"
          headerTemplate={
            <SportSelector sportCode={sportCode} setSportCode={setSportCode} />
          }
        />
        {tabViewItems}
      </TabView>
      {activeIndex < 0 && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          Select Division to Start
        </div>
      )}
    </div>
  );
};

export default DivisionNavigation;
