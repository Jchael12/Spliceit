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
  const { profile } = useApp();

  return (
    <div
      data-plop-surface={profile.surface}
      data-plop-theme="light"
      className="plop-surface min-h-screen"
    >
      <PlopProvider
        paint={false}
        theme="light"
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
