import { useEffect, useState } from "react";
import MainRouter from "./routers/MainRouter";
import Router from "./routers/router";
import { BrowserRouter, Route, Routes } from "react-router-dom";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Router />} />
      <Route path="/trangquantri/*" element={<MainRouter />} />
    </Routes>
  );
}

export default App;
