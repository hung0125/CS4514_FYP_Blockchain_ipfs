import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileManagement from "./pages/FileManagement";
import Hello from "./pages/Hello";
import UnitTest from "./pages/UnitTest";
import VersionCompare from "./pages/VersionCompare";

//This is the home page which routes to different the main components

const App = () => {

  return (
    <div className='min-h-screen'>

      <Router>
        <Routes>
          <Route exact path="/" element={<FileManagement />} />
          <Route path="/hello" element={<Hello />} />
          <Route path="/ut" element={<UnitTest />} />
          <Route path="/vercomp" element={<VersionCompare/>} />
        </Routes>
      </Router>

    </div>
  );
}

export default App
