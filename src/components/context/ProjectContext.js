import { createContext } from 'react'

const ProjectContext = createContext()

export const ProjectProvider = ({ children }) => {
  const project = [
    {
      id: 1,
      text: 'Feedback App',
      link: 'https://katyfeedbackapp.vercel.app/'
    },
    {
      id: 2,
      text: 'Github Finder App',
      link: 'https://katygithubfinder.vercel.app/'
    },
    {
      id: 3,
      text: 'House Marketplace',
      link: 'https://katyhousemarketplace.vercel.app/'
    }
  ]

  return (
    <ProjectContext.Provider
      value={{ project }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export default ProjectContext
