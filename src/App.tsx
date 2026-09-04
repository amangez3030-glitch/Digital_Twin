import { Navigate, Route, Routes, HashRouter } from "react-router-dom";
import Shell from "./layout/Shell";
import { getSession } from "./lib/auth";
import AuthPage from "./pages/Auth";
import Overview from "./pages/Overview";
import Design from "./pages/Design";
import Data from "./pages/Data";
import Models from "./pages/Models";
import Clustering from "./pages/Clustering";
import Intelligence from "./pages/Intelligence";
import Nlp from "./pages/Nlp";
import Xai from "./pages/Xai";
import Twin from "./pages/Twin";
import Delivery from "./pages/Delivery";
import Defense from "./pages/Defense";

/* The dossier sits behind a local workspace gate. */
function RequireAuth({ children }: { children: React.ReactElement }) {
  if (!getSession()) return <Navigate to="/auth" replace />;
  return children;
}

/* Already cleared? The gate sends you straight into the document. */
function AuthGate() {
  if (getSession()) return <Navigate to="/" replace />;
  return <AuthPage />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<AuthGate />} />
        <Route
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Overview />} />
          <Route path="/design" element={<Design />} />
          <Route path="/data" element={<Data />} />
          <Route path="/models" element={<Models />} />
          <Route path="/clustering" element={<Clustering />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/nlp" element={<Nlp />} />
          <Route path="/xai" element={<Xai />} />
          <Route path="/twin" element={<Twin />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/defense" element={<Defense />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
