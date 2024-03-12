import { motion, AnimatePresence } from 'framer-motion'
import { useContext } from 'react'
import ProjectItem from './ProjectItem'
import ProjectContext from './context/ProjectContext'

function ProjectList() {
  const { project } = useContext(ProjectContext)

  return (
    <div className='project-list'>
      <AnimatePresence>
        {project.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout
          >
            <ProjectItem
              key={item.id}
              item={item}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ProjectList
