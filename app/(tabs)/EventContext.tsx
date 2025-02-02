// EventContext.tsx
import React, { createContext, useState, ReactNode } from "react";

interface EventContextProps {
  eventsText: string;
  setEventsText: (text: string) => void;
}

export const EventContext = createContext<EventContextProps>({
  eventsText: "",
  setEventsText: () => {},
});

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [eventsText, setEventsText] = useState("");
  return (
    <EventContext.Provider value={{ eventsText, setEventsText }}>
      {children}
    </EventContext.Provider>
  );
};
