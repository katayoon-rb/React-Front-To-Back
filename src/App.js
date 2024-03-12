import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import ProjectList from './components/ProjectList'
import { ProjectProvider } from './components/context/ProjectContext.js'

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Header />
        <div className='container'>
          <Routes>
            <Route exact path='/' element={ <ProjectList /> }/>
          </Routes>
        </div>
      </Router>
    </ProjectProvider>
  )
}

export default App
