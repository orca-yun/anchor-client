// @ts-nocheck
import * as React from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

export function NavigationBlocker(
  navigationBlockerHandler,
  canShowDialogPrompt
) {
  const navigator = React.useContext(UNSAFE_NavigationContext).navigator;

  console.log(navigator)
  React.useEffect(() => {
    if (!canShowDialogPrompt) return;

    // For me, this is the dark part of the code
    // maybe because I didn't work with React Router 5,
    // and it emulates that
    const unblock = navigator.block((tx) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock();
          tx.retry();
        }
      };

      navigationBlockerHandler(autoUnblockingTx);
    });

    return unblock;
  });
}
