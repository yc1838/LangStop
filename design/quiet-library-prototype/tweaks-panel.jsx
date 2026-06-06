/* No-op design tweak shim for the exported prototype.
   The Claude design references tweak controls, but the shared handoff did not
   include that panel. Keep defaults active without rendering extra UI. */

function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((key, value) => {
    setValues(current => ({ ...current, [key]: value }));
  }, []);
  return [values, setTweak];
}

function TweaksPanel({ children }) {
  return null;
}

function TweakSection() {
  return null;
}

function TweakSlider() {
  return null;
}

function TweakRadio() {
  return null;
}

function TweakSelect() {
  return null;
}

function TweakColor() {
  return null;
}

Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakSlider,
  TweakRadio,
  TweakSelect,
  TweakColor,
});
