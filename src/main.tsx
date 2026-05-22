import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./App.tsx";
import "./index.css";
import "antd/dist/reset.css";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store";


const getCssVar = (varName: string, fallback: string) => {
  if (typeof document !== "undefined") {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || fallback;
  }
  return fallback;
};
const corporateTrustTheme = {
  token: {
    colorPrimary: getCssVar("--color-primary-600", "#4F46E5"),
    colorLink: getCssVar("--color-primary-600", "#4F46E5"),
    colorLinkHover: getCssVar("--color-secondary-600", "#7C3AED"),
    colorSuccess: getCssVar("--color-success", "#10B981"),
    colorWarning: getCssVar("--color-warning", "#F59E0B"),
    colorError: getCssVar("--color-error", "#EF4444"),
    colorBgBase: getCssVar("--color-bg-base", "#FFFFFF"),
    colorBgLayout: getCssVar("--color-bg-layout", "#F8FAFC"),
    colorTextBase: getCssVar("--color-text-primary", "#0F172A"),
    colorBorder: getCssVar("--color-border-primary", "#E2E8F0"),
    colorBorderSecondary: getCssVar("--color-border-secondary", "#F1F5F9"),
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily:
      '"Plus Jakarta Sans", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    controlHeight: 40,
    boxShadow:
      "0 4px 20px -2px rgba(79, 70, 229, 0.1)",
    boxShadowSecondary:
      "0 10px 25px -5px rgba(79, 70, 229, 0.15), 0 8px 10px -6px rgba(79, 70, 229, 0.1)",
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      activeBorderColor: getCssVar("--color-primary-600", "#4F46E5"),
      hoverBorderColor: getCssVar("--color-primary-400", "#818CF8"),
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 12,
      headerBg: getCssVar("--color-bg-layout", "#F8FAFC"),
      headerColor: getCssVar("--color-text-tertiary", "#6B7280"),
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};

createRoot(document.getElementById("root")!).render(
  <>
    <ConfigProvider theme={corporateTrustTheme}>
      <Provider store={store}>
        <App />
      </Provider>
    </ConfigProvider>
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          borderRadius: "12px",
          boxShadow: "0 4px 20px -2px rgba(79, 70, 229, 0.15)",
        },
      }}
    />
  </>
);
