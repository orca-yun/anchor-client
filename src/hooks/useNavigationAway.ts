// @ts-nocheck
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { NavigationBlocker } from "./NavigationBlocker";

export function useNavigatingAway(canShowDialogPrompt) {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [showDialogPrompt, setShowDialogPrompt] = useState(false);
  const [wantToNavigateTo, setWantToNavigateTo] = useState(null);
  const [isNavigationConfirmed, setIsNavigationConfirmed] = useState(false);

  const handleNavigationBlocking = useCallback(
    (locationToNavigateTo) => {
      if (
        !isNavigationConfirmed &&
        locationToNavigateTo.location.pathname !== currentLocation.pathname
      ) {
        setShowDialogPrompt(true);
        setWantToNavigateTo(locationToNavigateTo);
        return false;
      }
      return true;
    },
    [isNavigationConfirmed]
  );

  const cancelNavigation = useCallback(() => {
    setIsNavigationConfirmed(false);
    setShowDialogPrompt(false);
  }, []);

  const confirmNavigation = useCallback(() => {
    setIsNavigationConfirmed(true);
    setShowDialogPrompt(false);
  }, []);

  useEffect(() => {
    if (isNavigationConfirmed && wantToNavigateTo) {
      navigate(wantToNavigateTo.location.pathname);
    }
  }, [isNavigationConfirmed, wantToNavigateTo]);

  NavigationBlocker(handleNavigationBlocking, canShowDialogPrompt);

  return [showDialogPrompt, confirmNavigation, cancelNavigation];
}
