import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import Selectg from "./components/Selectgraph";
import QueryProcessor from "./components/QueryProcessor";
import GraphRender from "./components/GraphRender";
import { ThreeDMarqueeBg } from "./pages/HomePage";
import VoxBizAnimation from "./pages/Animation";
import {MainPage} from "./pages/MainPage";
import DatabaseDashboard from "./pages/DBSelection";
import DatabaseDetailsPage from "./pages/DBDetail";
// import VisualizationChoicePage from "./pages/VisChoice";
import DataTable from "./pages/Table";
import DatabaseRulesManager from "./pages/RuleManage";
import ForgotPassword from "./components/ForgotPwd";
import GoogleCallback from "./components/GoogleCallback";
import BarRender from "./components/barRender";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ThreeDMarqueeBg/>} />
        <Route path="/vox" element={<VoxBizAnimation />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/query" element={<QueryProcessor/>}/>
        <Route path="/table" element={<DataTable/>}/>
        <Route path="/selectgraph" element={<Selectg/>}/>
        <Route path="/rendergraph" element={<GraphRender/>}/>
        <Route path="/dblist" element={<DatabaseDashboard/>}/>
        {/* <Route path="/visChoice" element={<VisualizationChoicePage/>}/> */}
        <Route path="/database/:id" element={<DatabaseDetailsPage/>}/>
        <Route path="/rulemanage" element={<DatabaseRulesManager/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/barrender" element={<BarRender/>}/>
      </Routes>
    </Router>
  );
};

export default App;