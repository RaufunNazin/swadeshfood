import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import api from "../api";

const StoreSettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  delivery_charge: 50,
  free_delivery_threshold: 500,
};

export const StoreSettingsProvider = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshStoreSettings = async () => {
    setError(null);
    try {
      const res = await api.get("/admin/store-settings");
      if (res?.data) {
        setStoreSettings({
          delivery_charge: Number(
            res.data.delivery_charge ?? DEFAULT_SETTINGS.delivery_charge,
          ),
          free_delivery_threshold: Number(
            res.data.free_delivery_threshold ??
              DEFAULT_SETTINGS.free_delivery_threshold,
          ),
        });
      }
    } catch (err) {
      console.error("Failed to fetch store settings", err);
      setError(err);
      // keep last known settings; do not wipe
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStoreSettings();
  }, []);

  const value = useMemo(
    () => ({
      storeSettings,
      loading,
      error,
      refreshStoreSettings,
    }),
    [storeSettings, loading, error],
  );

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

StoreSettingsProvider.propTypes = {
  children: PropTypes.node,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStoreSettings = () => {
  const ctx = useContext(StoreSettingsContext);
  if (!ctx) {
    throw new Error(
      "useStoreSettings must be used inside StoreSettingsProvider",
    );
  }
  return ctx;
};
