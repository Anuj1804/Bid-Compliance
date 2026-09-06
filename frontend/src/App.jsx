import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tenders from "./pages/Tenders";
import Bidders from "./pages/Bidders";
import BidderDetails from "./pages/BidderDetails";
import DocumentVerification from "./pages/DocumentVerification";
import DeclaredVerified from "./pages/DeclaredVerified";
import OfficerReview from "./Components/OfficerReview";
import AuditTrailPage from "./pages/Audittrail";
import BlacklistSandbox from "./pages/BlacklistSandbox";
import AdminPanel from "./Components/AdminPanel";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/bidders" element={<Bidders />} />
        <Route path="/bidder_details" element={<BidderDetails />} />
        <Route path="/documentverification" element={<DocumentVerification />} />
        <Route path="/declared-verified" element={<DeclaredVerified />} />
        <Route path="/officer-review" element={<OfficerReview />} />
        <Route path="/audit-trail" element={<AuditTrailPage />} />
        <Route path="/blacklist-sandbox" element={<BlacklistSandbox />} />
        <Route path="/admin-panel" element={<AdminPanel />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;