import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { PlopProvider } from "@plop-ui/react";
import { useApp } from "./context/AppContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import ExpenseDetail from "./pages/ExpenseDetail";
import AddExpense from "./pages/AddExpense";
import Balances from "./pages/Balances";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default function App() {
  const { profile, theme } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.plopSurface = profile.surface;
    if (theme === "system") {
      delete root.dataset.plopTheme;
    } else {
      root.dataset.plopTheme = theme;
    }

    // Keep native controls and the mobile browser bar in step with the theme.
    root.style.colorScheme = theme === "system" ? "light dark" : theme;
    const themeColor = document.getElementById("theme-color");
    if (themeColor) {
      themeColor.setAttribute(
        "content",
        getComputedStyle(document.body).backgroundColor,
      );
    }
  }, [profile.surface, theme]);

  return (
    <div
      data-plop-surface={profile.surface}
      data-plop-theme={theme === "system" ? undefined : theme}
      className="plop-surface min-h-screen"
    >
      <PlopProvider
        paint={false}
        theme={theme}
        stickerShadow="soft"
        roundness={1}
      >
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="groups" element={<Groups />} />
              <Route path="groups/:groupId" element={<GroupDetail />} />
              <Route
                path="groups/:groupId/expenses/new"
                element={<AddExpense />}
              />
              <Route path="expenses/new" element={<AddExpense />} />
              <Route path="expenses/:expenseId" element={<ExpenseDetail />} />
              <Route
                path="expenses/:expenseId/edit"
                element={<AddExpense />}
              />
              <Route path="balances" element={<Balances />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PlopProvider>
    </div>
  );
}
