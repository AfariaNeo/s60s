import { useEffect } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";

// Initialize GA4 with your Measurement ID
const TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export const initGA = () => {
    // Only initialize if ID is present and not default
    if (TRACKING_ID && TRACKING_ID !== "G-XXXXXXXXXX") {
        ReactGA.initialize(TRACKING_ID);
    }
};

export const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        if (TRACKING_ID && TRACKING_ID !== "G-XXXXXXXXXX") {
            ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
        }
    }, [location]);

    return null;
};
